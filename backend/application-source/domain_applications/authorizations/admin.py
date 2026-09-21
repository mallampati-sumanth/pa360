from django.contrib import admin
from .models import AuthorizationRequest

@admin.register(AuthorizationRequest)
class AuthorizationRequestAdmin(admin.ModelAdmin):
    list_display = ('authorization_id', 'patient', 'provider', 'payer', 'status', 'priority', 'request_date')
    search_fields = ('patient__name', 'provider__provider_name', 'authorization_id')
    list_filter = ('status', 'priority', 'edge_case_type', 'requires_human_review')
