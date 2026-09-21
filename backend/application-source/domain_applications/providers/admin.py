from django.contrib import admin
from .models import Provider

@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ('provider_id', 'provider_name', 'npi_number', 'specialty', 'is_active')
    search_fields = ('provider_name', 'npi_number')
    list_filter = ('is_active', 'specialty')
