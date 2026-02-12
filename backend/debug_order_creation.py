import os
import django
import urllib.request
import urllib.parse
import json

# Setup Django environment to query DB directly for setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Product, Profile

BASE_URL = 'http://127.0.0.1:8000/api/'

def run_debug():
    # 1. Ensure we have a buyer and a product
    print("Setting up test data...")
    buyer, _ = User.objects.get_or_create(username='test_buyer')
    buyer.set_password('password123')
    buyer.save()
    if not hasattr(buyer, 'profile'):
        Profile.objects.create(user=buyer, role='BUYER')
    
    # Ensure there is a product
    farmer, _ = User.objects.get_or_create(username='test_farmer')
    if not hasattr(farmer, 'profile'):
        Profile.objects.create(user=farmer, role='FARMER')
        
    product = Product.objects.first()
    if not product:
        product = Product.objects.create(
            farmer=farmer,
            name='Test Tomato',
            description='Fresh',
            price=20.0,
            stock=100
        )
    print(f"Test Product: {product.name} (ID: {product.id}, Stock: {product.stock})")

    # 1.5 Verify API Reachability
    print("\nVerifying API Reachability...")
    try:
        req = urllib.request.Request(f"{BASE_URL}products/")
        with urllib.request.urlopen(req) as response:
            print(f"Products endpoint accessible. Status: {response.status}")
    except Exception as e:
        print(f"Products endpoint failed: {e}")
        # Continue anyway to debug login

    # 2. Login
    print("\nLogging in as buyer...")
    login_data = json.dumps({'username': 'test_buyer', 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}login/", data=login_data, headers={'Content-Type': 'application/json'})
    
    token = None
    try:
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode('utf-8')
            data = json.loads(resp_body)
            token = data.get('token')
            print(f"Login successful. Token: {token[:10]}...")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    if not token:
        print("No token received.")
        return

    # 3. Create Order
    print("\nAttempting to create order...")
    payload = {
        'items': [
            {'product_id': product.id, 'quantity': 1}
        ]
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}orders/", data=data, headers={
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    })
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.status}")
            print(f"Response: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    run_debug()
