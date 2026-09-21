from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SLABreachViewSet

router = DefaultRouter()
router.register(r'breaches', SLABreachViewSet, basename='slabreach')

urlpatterns = [
    path('', include(router.urls)),
]
