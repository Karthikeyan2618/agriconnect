import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Product, User

def diagnostic():
    with open('diagnostic_output.txt', 'w', encoding='utf-8') as f:
        products = Product.objects.all()
        f.write(f"Total products: {products.count()}\n")
        for i, p in enumerate(products):
            farmer_name = p.farmer.username if p.farmer else "NULL"
            f.write(f"[{i+1}] Name: {p.name}, Farmer: {farmer_name}, Price: {p.price}, Stock: {p.stock}\n")
        
        users = User.objects.all()
        f.write(f"\nTotal users: {users.count()}\n")
        for i, u in enumerate(users):
            try:
                role = u.profile.role
            except Exception:
                role = "N/A"
            f.write(f"[{i+1}] Username: {u.username}, Role: {role}\n")

if __name__ == "__main__":
    diagnostic()
