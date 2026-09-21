from rest_framework import viewsets
from .models import Plan
from .serializers import PlanSerializer
from domain_applications.authentication.permissions import ReadOnlyForProviderAndBilling

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [ReadOnlyForProviderAndBilling]
