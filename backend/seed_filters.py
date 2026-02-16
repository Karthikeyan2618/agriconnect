import os
import django
import datetime
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Profile, Product

def seed_data():
    # Chennai coordinates (Reference Point)
    CHENNAI_LAT = 13.0827
    CHENNAI_LON = 80.2707

    # Farmer 1 (Nearby - ~10km) - Tambaram area approx
    farmer1, _ = User.objects.get_or_create(username='farmer1')
    p1 = farmer1.profile
    p1.role = 'FARMER'
    p1.latitude = 12.9229
    p1.longitude = 80.1275
    p1.save()

    # Farmer 2 (Medium - ~40km) - Mahabalipuram area approx
    farmer2, _ = User.objects.get_or_create(username='farmer2')
    p2 = farmer2.profile
    p2.role = 'FARMER'
    p2.latitude = 12.6208
    p2.longitude = 80.1945
    p2.save()

    # Farmer 3 (Far - ~100km) - Pondicherry area approx
    farmer3, _ = User.objects.get_or_create(username='farmer3')
    p3 = farmer3.profile
    p3.role = 'FARMER'
    p3.latitude = 11.9416
    p3.longitude = 79.8083
    p3.save()

    # Buyer (At Chennai center)
    buyer, _ = User.objects.get_or_create(username='buyer1')
    pb = buyer.profile
    pb.role = 'BUYER'
    pb.latitude = CHENNAI_LAT
    pb.longitude = CHENNAI_LON
    pb.save()

    # Clear old products for demo if they exist or just add new ones
    # Product.objects.all().delete()

    today = datetime.date.today()

    Product.objects.get_or_create(
        name="Organic Tomatoes",
        farmer=farmer1,
        defaults={
            "description": "Freshly harvested organic tomatoes from Tambaram.",
            "price": 40.00,
            "stock": 100,
            "crop_type": "Organic Tomatoes",
            "harvest_date": today
        }
    )

    Product.objects.get_or_create(
        name="Fresh Carrots",
        farmer=farmer2,
        defaults={
            "description": "Crunchy carrots from Mahabalipuram fields.",
            "price": 60.00,
            "stock": 50,
            "crop_type": "Carrots",
            "harvest_date": today - datetime.timedelta(days=1)
        }
    )

    Product.objects.get_or_create(
        name="Green Grapes",
        farmer=farmer3,
        defaults={
            "description": "Sweet green grapes from Pondicherry vineyards.",
            "price": 120.00,
            "stock": 30,
            "crop_type": "Grapes",
            "harvest_date": today - datetime.timedelta(days=2)
        }
    )

    print("Seed data applied successfully.")

if __name__ == "__main__":
    seed_data()
