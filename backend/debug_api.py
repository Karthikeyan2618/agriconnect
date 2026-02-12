import urllib.request
import urllib.parse
import json

BASE_URL = 'http://127.0.0.1:8000/api/'

def debug_api():
    username = 'debug_farmer'
    password = 'password123'
    
    # Login
    print(f"Attempting login as {username}...")
    try:
        login_data = json.dumps({'username': username, 'password': password}).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}login/", data=login_data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode('utf-8')
            data = json.loads(resp_body)
            token = data.get('token')
            print(f"Login successful. Token: {token[:10]}...")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # Fetch Profile
    print(f"\nFetching Profile...")
    try:
        req = urllib.request.Request(f"{BASE_URL}profile/", headers={
            'Authorization': f'Token {token}'
        })
        with urllib.request.urlopen(req) as response:
            print(f"Profile Status: {response.status}")
            print(f"Profile Data: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"Profile fetch failed: {e}")

if __name__ == "__main__":
    debug_api()
