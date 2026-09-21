from rest_framework import viewsets
from .models import Provider
from .serializers import ProviderSerializer
from domain_applications.authentication.permissions import ReadOnlyForProviderAndBilling

class ProviderViewSet(viewsets.ModelViewSet):
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = [ReadOnlyForProviderAndBilling]
