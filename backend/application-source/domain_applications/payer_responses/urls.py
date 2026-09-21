from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayerResponseViewSet

router = DefaultRouter()
router.register(r'', PayerResponseViewSet, basename='payerresponse')

urlpatterns = [
    path('', include(router.urls)),
]
