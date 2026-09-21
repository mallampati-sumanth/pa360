from rest_framework import serializers
from .models import AuthorizationRequest, AuthorizationStatusHistory, MissingInformationItem
from domain_applications.patients.serializers import PatientSerializer
from domain_applications.providers.serializers import ProviderSerializer
from domain_applications.payers.serializers import PayerSerializer
from domain_applications.plans.serializers import PlanSerializer
from domain_applications.services.serializers import ServiceSerializer
from domain_applications.services.models import Service

class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AuthorizationStatusHistory
        fields = ['id', 'status', 'changed_at', 'changed_by', 'changed_by_name']

    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else None


class MissingInformationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissingInformationItem
        fields = ['id', 'item_name', 'status', 'source']

class AuthorizationRequestSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    provider = ProviderSerializer(read_only=True)
    payer = PayerSerializer(read_only=True)
    plan = PlanSerializer(read_only=True)
    service_code = ServiceSerializer(read_only=True)
    requested_services = ServiceSerializer(source='services', many=True, read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)
    missing_information_items = MissingInformationItemSerializer(many=True, read_only=True)
    documents = serializers.SerializerMethodField()
    payer_responses = serializers.SerializerMethodField()

    class Meta:
        model = AuthorizationRequest
        fields = [field.name for field in AuthorizationRequest._meta.fields] + [
            'status_history',
            'missing_information_items',
            'documents',
            'payer_responses',
            'requested_services',
        ]

    def get_documents(self, obj):
        return [
            {
                'document_id': str(document.document_id),
                'file_name': document.file_name,
                'document_type': document.document_type,
                'extracted_text': document.extracted_text,
                'extraction_status': document.extraction_status,
                'uploaded_at': document.uploaded_at,
            }
            for document in obj.documents.filter(is_active=True)
        ]

    def get_payer_responses(self, obj):
        return [
            {
                'response_id': str(response.response_id),
                'payer_name': response.payer_name,
                'response_type': response.response_type,
                'response_date': response.response_date,
                'response_text': response.response_text,
                'processed': response.processed,
            }
            for response in obj.payer_responses.order_by('-response_date')
        ]

class AuthorizationRequestCreateSerializer(serializers.ModelSerializer):
    service_codes = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(), many=True, required=False, write_only=True)

    class Meta:
        model = AuthorizationRequest
        fields = [
            field.name for field in AuthorizationRequest._meta.fields
            if field.name not in {
                'status', 'created_at', 'updated_at', 'missing_information',
                'submission_date', 'decision_date', 'reviewed_by',
                'ai_confidence_score', 'ai_summary',
            }
        ] + ['service_codes']

    def create(self, validated_data):
        services = validated_data.pop('service_codes', [])
        if services:
            validated_data['service_code'] = services[0]
        instance = super().create(validated_data)
        if services:
            instance.services.set(services)
        return instance

    def update(self, instance, validated_data):
        services = validated_data.pop('service_codes', None)
        if services:
            validated_data['service_code'] = services[0]
        instance = super().update(instance, validated_data)
        if services is not None:
            instance.services.set(services)
        return instance

class AuthorizationRequestListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    provider_name = serializers.CharField(source='provider.provider_name', read_only=True)
    payer_name = serializers.CharField(source='payer.payer_name', read_only=True)
    service_name = serializers.CharField(source='service_code.service_name', read_only=True)
    service_names = serializers.SerializerMethodField()

    class Meta:
        model = AuthorizationRequest
        fields = ['authorization_id', 'patient_name', 'provider_name', 'payer_name', 'service_name', 'service_names', 'status', 'priority', 'request_date']

    def get_service_names(self, obj):
        services = obj.services.all()
        return [service.service_name for service in services] or [obj.service_code.service_name]

class WorkflowActionSerializer(serializers.Serializer):
    action = serializers.CharField(required=True)
    metadata = serializers.JSONField(required=False, default=dict)

class AppealSerializer(serializers.Serializer):
    appeal_type = serializers.ChoiceField(choices=['APPEAL', 'PEER_TO_PEER', 'EXTERNAL_REVIEW'])
    reason = serializers.CharField(required=True)

class ClinicalUpdateSerializer(serializers.Serializer):
    notes = serializers.CharField(required=True)
