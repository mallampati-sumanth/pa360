import django_filters
from .models import AuthorizationRequest

class AuthorizationRequestFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=AuthorizationRequest.Status.choices)
    priority = django_filters.ChoiceFilter(choices=AuthorizationRequest.Priority.choices)
    edge_case_type = django_filters.ChoiceFilter(choices=AuthorizationRequest.EdgeCaseType.choices)
    requires_human_review = django_filters.BooleanFilter()
    start_date = django_filters.DateFilter(field_name="request_date", lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name="request_date", lookup_expr='lte')
    patient_id = django_filters.CharFilter(field_name="patient__patient_id")
    payer_id = django_filters.CharFilter(field_name="payer__payer_id")
    provider_id = django_filters.CharFilter(field_name="provider__provider_id")

    class Meta:
        model = AuthorizationRequest
        fields = ['status', 'priority', 'edge_case_type', 'requires_human_review', 'patient', 'payer', 'provider']
