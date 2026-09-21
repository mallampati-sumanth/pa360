from django.contrib import admin
from .models import PayerResponse

@admin.register(PayerResponse)
class PayerResponseAdmin(admin.ModelAdmin):
    list_display = ('response_id', 'payer_name', 'response_type', 'processed', 'created_at')
    list_filter = ('response_type', 'processed')
