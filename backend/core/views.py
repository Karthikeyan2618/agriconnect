from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth.models import User
from .models import Product, Profile, CropPlan, Order, OrderItem
from .serializers import UserSerializer, ProductSerializer, ProfileSerializer, CropPlanSerializer, OrderSerializer
from .utils import generate_invoice_pdf
from django.http import HttpResponse
from rest_framework.decorators import action

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class CustomLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'role': user.profile.role,
            'land_size': user.profile.land_size,
            'location': user.profile.location,
            'soil_type': user.profile.soil_type
        })

class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    def get_queryset(self):
        queryset = Product.objects.all()
        role = self.request.query_params.get('role', None)
        if role == 'FARMER' and self.request.user.is_authenticated:
            return queryset.filter(farmer=self.request.user)
        return queryset.exclude(farmer__isnull=True)

class CropPlanViewSet(viewsets.ModelViewSet):
    queryset = CropPlan.objects.all()
    serializer_class = CropPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        land_size = self.request.user.profile.land_size or 1.0
        volume = land_size * 500.0 
        serializer.save(farmer=self.request.user, estimated_volume=volume)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.profile.role == 'FARMER':
            # Farmers see orders that contain their products
            return Order.objects.filter(items__product__farmer=user).distinct()
        # Buyers see their own orders
        return Order.objects.filter(buyer=user)

    def create(self, request, *args, **kwargs):
        # Expected Data: { "items": [ {"product_id": 1, "quantity": 2}, ... ] }
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = 0
        order_items = []

        # Validate and Calculate Total
        for item in items_data:
            try:
                product = Product.objects.get(id=item['product_id'])
                if product.stock < item['quantity']:
                    return Response({'error': f"Insufficient stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)
                total = product.price * item['quantity']
                total_amount += total
                order_items.append({
                    'product': product,
                    'quantity': item['quantity'],
                    'price': product.price
                })
            except Product.DoesNotExist:
                return Response({'error': f"Product {item['product_id']} not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Create Order
        order = Order.objects.create(buyer=request.user, total_amount=total_amount)

        # Create Items and Update Stock
        for item in order_items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['price']
            )
            item['product'].stock -= item['quantity']
            item['product'].save()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download_invoice(self, request, pk=None):
        order = self.get_object()
        # Ensure user is allowed to download (Buyer or Farmer involved)
        if request.user != order.buyer and not order.items.filter(product__farmer=request.user).exists():
             return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        pdf = generate_invoice_pdf(order)
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{order.id}.pdf"'
        return response

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        # Only Farmers/Admin can update status (simplification: any farmer involved can update for now, or just specific role chcek)
        if request.user.profile.role != 'FARMER':
             return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'status': 'Order status updated'})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

