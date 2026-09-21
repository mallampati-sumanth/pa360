from rest_framework import serializers
from .models import Patient
from domain_applications.plans.serializers import PlanSerializer

class PatientSerializer(serializers.ModelSerializer):
    plan_details = PlanSerializer(source='plan', read_only=True)
    provider_suggestions = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [field.name for field in Patient._meta.fields] + ['plan_details', 'provider_suggestions']

    def get_provider_suggestions(self, obj):
        return list(obj.authorizations.select_related('provider').values(
            'provider__provider_id', 'provider__provider_name'
        ).distinct())

class PatientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class PatientListSerializer(serializers.ModelSerializer):
    plan_id = serializers.CharField(read_only=True)
    payer_id = serializers.CharField(source='plan.payer_id', read_only=True)
    provider_suggestions = serializers.SerializerMethodField()

    def get_provider_suggestions(self, obj):
        return list(obj.authorizations.select_related('provider').values(
            'provider__provider_id', 'provider__provider_name'
        ).distinct())

    class Meta:
        model = Patient
        fields = ['patient_id', 'name', 'date_of_birth', 'insurance_id', 'plan_id', 'payer_id', 'provider_suggestions', 'enrollment_status', 'provisional_record']
