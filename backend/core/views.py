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
import math

def haversine(lat1, lon1, lat2, lon2):
    # Radius of the Earth in km
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

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
        
        # Base filtering:
        # 1. If role=FARMER param is passed (Dashboard fetch), show user's own products
        # 2. If user is a FARMER role, they should also only see their own products in the marketplace to avoid confusion (My Store view)
        # 3. Otherwise (Buyers/Guests), show products from verified farmers.
        
        is_farmer = False
        if self.request.user.is_authenticated:
            try:
                is_farmer = (self.request.user.profile.role == 'FARMER')
            except:
                pass

        if is_farmer:
            queryset = queryset.filter(farmer=self.request.user)
        else:
            queryset = queryset.filter(farmer__profile__role='FARMER')

        # Additional Filters
        crop_type = self.request.query_params.get('crop_type', None)
        if crop_type:
            queryset = queryset.filter(crop_type__icontains=crop_type)

        harvest_date = self.request.query_params.get('harvest_date', None)
        if harvest_date:
            queryset = queryset.filter(harvest_date=harvest_date)

        max_distance = self.request.query_params.get('max_distance', None)
        if max_distance and self.request.user.is_authenticated:
            try:
                max_dist = float(max_distance)
                buyer_profile = self.request.user.profile
                if buyer_profile.latitude is not None and buyer_profile.longitude is not None:
                    # Filter in-memory for distance
                    filtered_ids = []
                    for product in queryset:
                        # Priority: Product coordinates > Farmer Profile coordinates
                        if product.latitude is not None and product.longitude is not None:
                            p_lat, p_lon = product.latitude, product.longitude
                        elif product.farmer and hasattr(product.farmer, 'profile') and product.farmer.profile.latitude is not None:
                            p_lat, p_lon = product.farmer.profile.latitude, product.farmer.profile.longitude
                        else:
                            continue

                        dist = haversine(
                            buyer_profile.latitude, buyer_profile.longitude,
                            p_lat, p_lon
                        )
                        if dist <= max_dist:
                            filtered_ids.append(product.id)
                    queryset = queryset.filter(id__in=filtered_ids)
            except (ValueError, TypeError, AttributeError):
                pass

        return queryset

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
        try:
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
        except Exception as e:
            return Response({'error': f"Failed to create order: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

