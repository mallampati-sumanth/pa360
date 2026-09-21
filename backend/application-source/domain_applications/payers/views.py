from rest_framework import viewsets
from .models import Payer
from .serializers import PayerSerializer
from domain_applications.authentication.permissions import ReadOnlyForProviderAndBilling

class PayerViewSet(viewsets.ModelViewSet):
    queryset = Payer.objects.all()
    serializer_class = PayerSerializer
    permission_classes = [ReadOnlyForProviderAndBilling]
