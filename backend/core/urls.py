from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SignupView, CustomLoginView, ProductViewSet, ProfileUpdateView, CropPlanViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'crop-plans', CropPlanViewSet)
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('', include(router.urls)),
]
