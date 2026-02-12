import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import get_resolver, URLPattern, URLResolver

def print_urls(resolver, prefix=''):
    for pattern in resolver.url_patterns:
        if isinstance(pattern, URLPattern):
            print(f"{prefix}{pattern.pattern}")
        elif isinstance(pattern, URLResolver):
            print_urls(pattern, prefix=f"{prefix}{pattern.pattern}")

if __name__ == "__main__":
    print_urls(get_resolver())
