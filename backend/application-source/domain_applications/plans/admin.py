from django.contrib import admin
from .models import Plan

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('plan_id', 'plan_name', 'payer', 'is_active', 'effective_date')
    search_fields = ('plan_name', 'plan_id')
    list_filter = ('is_active', 'payer')
