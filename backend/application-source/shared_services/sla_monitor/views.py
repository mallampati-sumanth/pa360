from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SLABreach
from domain_applications.authentication.permissions import IsOpsManager

class SLABreachSerializer(serializers.ModelSerializer):
    class Meta:
        model = SLABreach
        fields = '__all__'

class SLABreachViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SLABreach.objects.all()
    serializer_class = SLABreachSerializer
    permission_classes = [IsOpsManager]

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        breach = self.get_object()
        breach.acknowledged = True
        breach.acknowledged_by = request.user
        breach.save()
        return Response({"status": "Acknowledged"})
