from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Profile, CropPlan

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['land_size', 'location', 'soil_type', 'latitude', 'longitude']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True, required=False)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop('role', 'BUYER')
        user = User.objects.create_user(**validated_data)
        # Profile is created by signal, just update the role
        user.profile.role = role
        user.profile.save()
        return user

class ProductSerializer(serializers.ModelSerializer):
    farmer_location = serializers.ReadOnlyField(source='farmer.profile.location')

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['farmer']

class CropPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropPlan
        fields = [
            'id', 'farmer', 'crop_variety', 'planting_date',
            'expected_harvest_date', 'estimated_volume', 'created_at'
        ]
        read_only_fields = ['farmer', 'estimated_volume', 'created_at']

from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.ReadOnlyField(source='buyer.username')

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'buyer_name', 'total_amount', 'status', 'created_at', 'items']
        read_only_fields = ['buyer', 'total_amount', 'status', 'created_at']
