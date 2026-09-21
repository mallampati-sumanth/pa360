from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PayerResponse
from .serializers import PayerResponseSerializer
from domain_applications.authentication.permissions import IsSpecialistManagerOrBilling
from domain_applications.authorizations.models import AuthorizationRequest
from domain_applications.authorizations.workflow import advance_workflow

class PayerResponseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PayerResponse.objects.all()
    serializer_class = PayerResponseSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsSpecialistManagerOrBilling])
    def process(self, request, pk=None):
        response_obj = self.get_object()
        if response_obj.processed:
            return Response({"error": "Already processed"}, status=status.HTTP_400_BAD_REQUEST)
            
        response_obj.processed = True
        response_obj.processed_at = timezone.now()
        response_obj.save()
        auth_request = response_obj.authorization_request
        follow_up_response = response_obj.response_type in {
            PayerResponse.ResponseType.PENDING,
            PayerResponse.ResponseType.ADDITIONAL_INFO_REQUESTED,
        }
        if follow_up_response and auth_request.status == AuthorizationRequest.Status.PENDING:
            advance_workflow(
                auth_request,
                AuthorizationRequest.Status.ADDITIONAL_INFO_REQUESTED,
                request.user,
                metadata={'reason': 'Payer requested additional information'},
            )
        return Response({"status": "Processed", "authorization_status": auth_request.status})
