from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'entity_type', 'entity_id', 'actor', 'timestamp', 'ip_address')
    list_filter = ('action', 'entity_type')
    search_fields = ('entity_id', 'actor__username')
