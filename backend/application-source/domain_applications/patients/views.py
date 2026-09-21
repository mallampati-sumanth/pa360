from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Patient
from .serializers import PatientSerializer, PatientCreateSerializer, PatientListSerializer
from domain_applications.authentication.permissions import IsSpecialistOrManager, IsOpsManager

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return PatientListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return PatientCreateSerializer
        return PatientSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'link_provisional']:
            return [IsSpecialistOrManager()]
        if self.action == 'destroy':
            return [IsOpsManager()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def link_provisional(self, request, pk=None):
        provisional_patient = self.get_object()
        if not provisional_patient.provisional_record:
            return Response({"error": "Not a provisional record"}, status=status.HTTP_400_BAD_REQUEST)
        
        real_insurance_id = request.data.get('insurance_id')
        if not real_insurance_id:
            return Response({"error": "insurance_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        provisional_patient.insurance_id = real_insurance_id
        provisional_patient.provisional_record = False
        provisional_patient.enrollment_status = Patient.EnrollmentStatus.ACTIVE
        provisional_patient.save()
        
        return Response(self.get_serializer(provisional_patient).data)
