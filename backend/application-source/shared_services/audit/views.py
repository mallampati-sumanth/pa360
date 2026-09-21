from rest_framework import viewsets
from .models import AuditLog
from .serializers import AuditLogSerializer
from domain_applications.authentication.permissions import IsOpsManager

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsOpsManager]
