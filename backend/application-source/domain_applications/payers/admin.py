from django.contrib import admin
from .models import Payer

@admin.register(Payer)
class PayerAdmin(admin.ModelAdmin):
    list_display = ('payer_id', 'payer_name', 'is_active')
    search_fields = ('payer_name', 'payer_id')
    list_filter = ('is_active',)
