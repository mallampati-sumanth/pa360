from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'name', 'insurance_id', 'enrollment_status', 'provisional_record')
    search_fields = ('patient_id', 'name', 'insurance_id')
    list_filter = ('enrollment_status', 'provisional_record')
