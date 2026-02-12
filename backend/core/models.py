from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = (
        ('FARMER', 'Farmer'),
        ('BUYER', 'Buyer'),
    )
    SOIL_CHOICES = (
        ('SILT', 'Silt'),
        ('CLAY', 'Clay'),
        ('LOAM', 'Loam'),
        ('SANDY', 'Sandy'),
        ('PEAT', 'Peat'),
        ('CHALK', 'Chalk'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='BUYER')
    
    # Farm Profile Fields (for Farmers)
    land_size = models.FloatField(null=True, blank=True, help_text="Size in acres")
    location = models.CharField(max_length=100, null=True, blank=True, help_text="Location details or coordinates")
    soil_type = models.CharField(max_length=20, choices=SOIL_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"



class Product(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    crop_type = models.CharField(max_length=100, blank=True, null=True)
    harvest_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CropPlan(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crop_plans')
    crop_variety = models.CharField(max_length=100)
    planting_date = models.DateField()
    expected_harvest_date = models.DateField()
    estimated_volume = models.FloatField(default=0.0, help_text="Estimated harvest in kg")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_variety} - {self.farmer.username}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PACKED', 'Packed'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('COMPLETED', 'Completed'),
    )
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.buyer.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Snapshot of price at purchase time

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

