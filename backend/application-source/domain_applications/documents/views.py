from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import AuthorizationDocument
from .serializers import AuthorizationDocumentSerializer, AuthorizationDocumentUploadSerializer
from shared_services.audit.service import log_action

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorizationDocumentSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return AuthorizationDocumentUploadSerializer
        return AuthorizationDocumentSerializer

    def get_queryset(self):
        qs = AuthorizationDocument.objects.filter(is_active=True)
        auth_req_id = self.request.query_params.get('authorization_request')
        if auth_req_id:
            qs = qs.filter(authorization_request_id=auth_req_id)
        return qs

    def perform_create(self, serializer):
        actor = self.request.user if self.request.user.is_authenticated else None
        doc = serializer.save(uploaded_by=actor)
        auth_req = doc.authorization_request
        from domain_applications.authorizations.models import MissingInformationItem
        MissingInformationItem.objects.filter(
            authorization_request=auth_req,
            item_name__in=['supporting_document', 'clinical_note'],
        ).update(status=MissingInformationItem.ItemStatus.UPLOADED)
        from shared_services.ai_engine.base import get_ai_engine
        engine = get_ai_engine()
        documents_text = ' '.join(auth_req.documents.values_list('extracted_text', flat=True))
        extraction = engine.extract_document(documents_text)
        auth_req.ai_summary = engine.summarize_for_authorization(auth_req).get('summary', '')
        auth_req.ai_confidence_score = engine.score_confidence(extraction)
        auth_req.save(update_fields=['ai_summary', 'ai_confidence_score', 'updated_at'])
        log_action(
            actor=actor,
            action="DOCUMENT_UPLOADED",
            entity_type="document",
            entity_id=str(doc.document_id),
            metadata={"file_name": doc.file_name}
        )
        # TODO: Trigger AI extraction task here

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        doc.is_active = False
        doc.save()
        log_action(
            actor=request.user,
            action="DOCUMENT_DELETED",
            entity_type="document",
            entity_id=str(doc.document_id)
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
