from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayerViewSet

router = DefaultRouter()
router.register(r'', PayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
