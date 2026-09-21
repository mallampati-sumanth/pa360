from rest_framework import viewsets, status, filters as drf_filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from .models import AuthorizationRequest, AuthorizationStatusHistory, MissingInformationItem
from .serializers import (
    AuthorizationRequestSerializer, AuthorizationRequestCreateSerializer,
    AuthorizationRequestListSerializer, WorkflowActionSerializer,
    AppealSerializer, ClinicalUpdateSerializer, StatusHistorySerializer,
    MissingInformationItemSerializer,
)
from .filters import AuthorizationRequestFilter
from .workflow import advance_workflow, get_available_actions
from .rules_engine import check_pa_requirement, check_completeness, should_route_to_human
from .edge_cases import handle_emergency_retro_auth, handle_denial_appeal, check_clinical_change
from domain_applications.authentication.permissions import IsSpecialistOrManager, IsSpecialistManagerOrBilling, IsOpsManager, ReadOnlyForProviderAndBilling, local_demo_mode

class AuthorizationRequestViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = AuthorizationRequestFilter
    search_fields = ['patient__name', 'diagnosis']
    ordering_fields = ['request_date', 'priority', 'status']

    def get_queryset(self):
        user = self.request.user
        qs = AuthorizationRequest.objects.all()
        if not getattr(user, 'is_authenticated', False):
            return qs
        if user.role == 'PROVIDER' and not local_demo_mode():
            qs = qs.filter(provider__provider_name=user.username)  # Simplified for example
        elif user.role == 'BILLING' and not local_demo_mode():
            qs = qs.filter(status__in=[AuthorizationRequest.Status.APPROVED, AuthorizationRequest.Status.DENIED])
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return AuthorizationRequestListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return AuthorizationRequestCreateSerializer
        return AuthorizationRequestSerializer

    def perform_create(self, serializer):
        auth_req = serializer.save()
        AuthorizationStatusHistory.objects.create(
            authorization_request=auth_req,
            status=auth_req.status,
            changed_by=self.request.user if self.request.user.is_authenticated else None,
        )

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'submit', 'review', 'approve_for_submission']:
            return [IsSpecialistOrManager()]
        if self.action in ['validate_coverage', 'record_decision', 'record_service_delivery', 'billing_handoff']:
            return [IsSpecialistManagerOrBilling()]
        if self.action == 'destroy':
            return [IsOpsManager()]
        return [ReadOnlyForProviderAndBilling()]

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        auth_req = self.get_object()
        try:
            advance_workflow(auth_req, AuthorizationRequest.Status.SUBMITTED, request.user)
            return Response({"status": "Submitted"})
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        auth_req = self.get_object()
        auth_req.reviewed_by = request.user
        auth_req.save()
        return Response({"status": "Review started"})

    @action(detail=True, methods=['post'])
    def approve_for_submission(self, request, pk=None):
        auth_req = self.get_object()
        verified = request.data.get('verified')
        if not isinstance(verified, dict) or not verified or not all(bool(value) for value in verified.values()):
            return Response(
                {"error": "All human verification checks must be completed before approval."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            advance_workflow(auth_req, AuthorizationRequest.Status.READY_FOR_SUBMISSION, request.user)
            return Response({"status": "Ready for submission"})
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def validate_coverage(self, request, pk=None):
        auth_req = self.get_object()
        try:
            advance_workflow(auth_req, AuthorizationRequest.Status.COVERAGE_VALIDATION, request.user, metadata={'notes': request.data.get('notes', '')})
            return Response({'status': auth_req.status})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def record_decision(self, request, pk=None):
        auth_req = self.get_object()
        try:
            advance_workflow(auth_req, AuthorizationRequest.Status.APPROVED, request.user)
            return Response({'status': auth_req.status})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def record_service_delivery(self, request, pk=None):
        auth_req = self.get_object()
        try:
            advance_workflow(auth_req, AuthorizationRequest.Status.SERVICE_DELIVERY, request.user)
            return Response({'status': auth_req.status})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def billing_handoff(self, request, pk=None):
        auth_req = self.get_object()
        try:
            advance_workflow(auth_req, AuthorizationRequest.Status.BILLING_RCM, request.user)
            return Response({'status': auth_req.status})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def check_pa_requirement(self, request, pk=None):
        auth_req = self.get_object()
        services = list(auth_req.services.all()) or [auth_req.service_code]
        results = [check_pa_requirement(auth_req.payer, auth_req.plan, service, {"is_emergency": auth_req.priority == AuthorizationRequest.Priority.EMERGENCY}) for service in services]
        result = results[0]
        return Response({
            "outcome": 'REQUIRED' if any(item.is_required for item in results) else 'NOT_REQUIRED',
            "is_required": any(item.is_required for item in results),
            "needs_review": any(item.needs_review for item in results),
            "reason": ' '.join(f'{service.service_name}: {item.reason}' for service, item in zip(services, results)),
            "services": [
                {"service_code": service.service_code, "service_name": service.service_name, "outcome": item.outcome, "is_required": item.is_required, "needs_review": item.needs_review, "reason": item.reason}
                for service, item in zip(services, results)
            ],
        })

    @action(detail=True, methods=['post'])
    def check_completeness(self, request, pk=None):
        auth_req = self.get_object()
        result = check_completeness(auth_req)
        return Response({"is_complete": result.is_complete, "missing_fields": result.missing_fields})

    @action(detail=True, methods=['post'])
    def retro_auth(self, request, pk=None):
        auth_req = self.get_object()
        result = handle_emergency_retro_auth(auth_req, request.data)
        return Response(result.data)

    @action(detail=True, methods=['post'])
    def appeal(self, request, pk=None):
        auth_req = self.get_object()
        serializer = AppealSerializer(data=request.data)
        if serializer.is_valid():
            result = handle_denial_appeal(auth_req, serializer.validated_data['appeal_type'], serializer.validated_data['reason'])
            return Response(result)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def check_clinical_change(self, request, pk=None):
        auth_req = self.get_object()
        serializer = ClinicalUpdateSerializer(data=request.data)
        if serializer.is_valid():
            result = check_clinical_change(auth_req, serializer.validated_data)
            return Response(result)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def ai_analyze(self, request, pk=None):
        auth_req = self.get_object()
        from shared_services.ai_engine.base import get_ai_engine
        engine = get_ai_engine()
        
        # Mocking an AI analysis
        docs_text = " ".join([doc.extracted_text for doc in auth_req.documents.all()]) if auth_req.documents.exists() else "No documents provided."
        extraction = engine.extract_document(docs_text)
        summary = engine.summarize_for_authorization(auth_req)
        confidence = engine.score_confidence(extraction)
        
        auth_req.ai_summary = summary.get("summary", "")
        auth_req.ai_confidence_score = confidence
        auth_req.save()
        
        return Response({
            "confidence": confidence,
            "summary": auth_req.ai_summary,
            "extracted": extraction.get("extracted_fields", [])
        })

    @action(detail=True, methods=['post'])
    def submit_to_payer(self, request, pk=None):
        auth_req = self.get_object()
        try:
            if auth_req.status != AuthorizationRequest.Status.READY_FOR_SUBMISSION:
                return Response(
                    {"error": "A human must approve this authorization before payer submission."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            advance_workflow(auth_req, AuthorizationRequest.Status.SUBMITTED, request.user)
            
            # Create a mock payer response
            from domain_applications.payer_responses.models import PayerResponse
            from django.utils import timezone
            PayerResponse.objects.create(
                authorization_request=auth_req,
                payer=auth_req.payer,
                payer_name=auth_req.payer.payer_name,
                response_type=PayerResponse.ResponseType.PENDING,
                response_date=timezone.now(),
                response_text="Additional clinical information required. Please submit prior treatment history.",
                raw_response_data={"status": "PENDING", "message": "Additional clinical information required. Please submit prior treatment history."},
                processed=False
            )
            
            # Advance workflow to pending to simulate payer action
            advance_workflow(auth_req, AuthorizationRequest.Status.PENDING, request.user, metadata={"reason": "Mock payer set to pending"})
            
            return Response({"status": "Submitted and Payer Response Received"})
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def missing_info(self, request, pk=None):
        auth_req = self.get_object()
        return Response(MissingInformationItemSerializer(
            auth_req.missing_information_items.all(), many=True
        ).data)

    @action(detail=True, methods=['get'])
    def status_history(self, request, pk=None):
        auth_req = self.get_object()
        return Response(StatusHistorySerializer(auth_req.status_history.all(), many=True).data)

    @action(detail=False, methods=['get'])
    def exception_queue(self, request):
        qs = self.get_queryset().filter(status=AuthorizationRequest.Status.EXCEPTION)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def manager_summary(self, request):
        summary = list(self.get_queryset().values('status').annotate(count=Count('authorization_id')))
        exception_count = self.get_queryset().filter(status=AuthorizationRequest.Status.EXCEPTION).count()
        return Response({
            "statuses": summary,
            "exception_count": exception_count,
            "sla_health": "91%",
            "active_specialists": 18
        })
