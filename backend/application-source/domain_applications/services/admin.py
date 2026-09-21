from django.contrib import admin
from .models import Service

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('service_code', 'service_name', 'specialty', 'authorization_required', 'is_active')
    search_fields = ('service_code', 'service_name')
    list_filter = ('authorization_required', 'is_active', 'specialty')
