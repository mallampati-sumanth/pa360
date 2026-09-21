from django.db import models
from django.utils.translation import gettext_lazy as _
from domain_applications.plans.models import Plan

class Patient(models.Model):
    class Gender(models.TextChoices):
        MALE = 'M', _('Male')
        FEMALE = 'F', _('Female')
        OTHER = 'O', _('Other')

    class EnrollmentStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        PENDING_ENROLLMENT = 'PENDING_ENROLLMENT', _('Pending Enrollment')
        INACTIVE = 'INACTIVE', _('Inactive')

    patient_id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=Gender.choices)
    insurance_id = models.CharField(max_length=100, null=True, blank=True)
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='patients')
    contact_number = models.CharField(max_length=20)
    address = models.TextField()
    enrollment_status = models.CharField(max_length=50, choices=EnrollmentStatus.choices, default=EnrollmentStatus.ACTIVE)
    provisional_record = models.BooleanField(default=False)
    linked_from = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='linked_to')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ingestion_timestamp = models.DateTimeField(null=True, blank=True)
    source_batch_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.patient_id})"
