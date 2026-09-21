from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db import connection

class HealthCheckView(APIView):
    permission_classes = []
    
    def get(self, request):
        db_status = "ok"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_status = "failed"
            
        return Response({
            "status": "ok",
            "db_connectivity": db_status,
            "version": "1.0.0",
            "timestamp": timezone.now().isoformat()
        })

urlpatterns = [
    path('', HealthCheckView.as_view(), name='health_check'),
]
