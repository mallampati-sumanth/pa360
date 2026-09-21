from rest_framework import viewsets
from .models import Service
from .serializers import ServiceSerializer
from domain_applications.authentication.permissions import ReadOnlyForProviderAndBilling

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [ReadOnlyForProviderAndBilling]
