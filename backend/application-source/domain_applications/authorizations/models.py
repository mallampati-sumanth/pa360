import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from domain_applications.patients.models import Patient
from domain_applications.providers.models import Provider
from domain_applications.payers.models import Payer
from domain_applications.plans.models import Plan
from domain_applications.services.models import Service

User = get_user_model()

class AuthorizationRequest(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'Draft', _('Draft')
        READY_FOR_SUBMISSION = 'Ready for Submission', _('Ready for Submission')
        SUBMITTED = 'Submitted', _('Submitted')
        PENDING = 'Pending', _('Pending')
        ADDITIONAL_INFO_REQUESTED = 'Additional Info Requested', _('Additional Info Requested')
        COVERAGE_VALIDATION = 'Coverage Validation', _('Coverage Validation')
        NOT_REQUIRED = 'Not Required', _('Not Required')
        APPROVED = 'Approved', _('Approved')
        SERVICE_DELIVERY = 'Service Delivery', _('Service Delivery')
        BILLING_RCM = 'Billing / RCM', _('Billing / RCM')
        DENIED = 'Denied', _('Denied')
        EXPIRED = 'Expired', _('Expired')
        EXISTING_REUSED = 'Existing (Reused)', _('Existing (Reused)')
        EXCEPTION = 'Exception – Review Required', _('Exception – Review Required')

    class Priority(models.TextChoices):
        ROUTINE = 'ROUTINE', _('Routine')
        URGENT = 'URGENT', _('Urgent')
        EMERGENCY = 'EMERGENCY', _('Emergency')

    class EdgeCaseType(models.TextChoices):
        NONE = 'NONE', _('None')
        EMERGENCY_RETRO = 'EMERGENCY_RETRO', _('Emergency Retro-Auth')
        NEWBORN_NEW_ENROLLEE = 'NEWBORN_NEW_ENROLLEE', _('Newborn/New Enrollee')
        APPROVED_NOT_COVERED = 'APPROVED_NOT_COVERED', _('Approved but Not Covered')
        DENIAL_APPEAL = 'DENIAL_APPEAL', _('Denial/Appeal')
        CLINICAL_CHANGE = 'CLINICAL_CHANGE', _('Clinical Change')
        COB = 'COB', _('Coordination of Benefits')

    class AppealStatus(models.TextChoices):
        NOT_APPLICABLE = 'NOT_APPLICABLE', _('Not Applicable')
        APPEAL_FILED = 'APPEAL_FILED', _('Appeal Filed')
        PEER_TO_PEER_REQUESTED = 'PEER_TO_PEER_REQUESTED', _('Peer-to-Peer Requested')
        EXTERNAL_REVIEW_REQUESTED = 'EXTERNAL_REVIEW_REQUESTED', _('External Review Requested')
        APPEAL_APPROVED = 'APPEAL_APPROVED', _('Appeal Approved')
        APPEAL_DENIED = 'APPEAL_DENIED', _('Appeal Denied')

    authorization_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='authorizations')
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='authorizations')
    payer = models.ForeignKey(Payer, on_delete=models.CASCADE, related_name='authorizations')
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='authorizations')
    service_code = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='authorizations')
    services = models.ManyToManyField(Service, related_name='authorization_requests', blank=True)
    
    diagnosis = models.CharField(max_length=255)
    clinical_indication = models.TextField()
    request_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.DRAFT)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.ROUTINE)
    
    missing_information = models.JSONField(default=list, blank=True)
    supporting_document = models.CharField(max_length=255, null=True, blank=True)
    
    submission_date = models.DateField(null=True, blank=True)
    decision_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_authorizations')
    
    ai_confidence_score = models.FloatField(null=True, blank=True)
    ai_summary = models.TextField(blank=True)
    requires_human_review = models.BooleanField(default=False)
    human_review_reason = models.TextField(blank=True)
    
    edge_case_type = models.CharField(max_length=50, choices=EdgeCaseType.choices, default=EdgeCaseType.NONE)
    edge_case_notes = models.TextField(blank=True)
    
    is_retro_auth = models.BooleanField(default=False)
    retro_auth_reason = models.TextField(blank=True)
    
    denial_code = models.CharField(max_length=100, blank=True)
    denial_reason = models.TextField(blank=True)
    appeal_status = models.CharField(max_length=50, choices=AppealStatus.choices, default=AppealStatus.NOT_APPLICABLE)
    
    primary_payer = models.ForeignKey(Payer, on_delete=models.SET_NULL, null=True, blank=True, related_name='primary_authorizations')
    secondary_payer = models.ForeignKey(Payer, on_delete=models.SET_NULL, null=True, blank=True, related_name='secondary_authorizations')
    
    coverage_verified = models.BooleanField(default=False)
    coverage_notes = models.TextField(blank=True)
    
    reused_from = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reused_authorizations')
    
    clinical_change_detected = models.BooleanField(default=False)
    clinical_change_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['patient']),
            models.Index(fields=['payer']),
            models.Index(fields=['request_date']),
        ]

    def __str__(self):
        return f"{self.authorization_id} - {self.status}"


class AuthorizationStatusHistory(models.Model):
    authorization_request = models.ForeignKey(
        AuthorizationRequest,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    status = models.CharField(max_length=50, choices=AuthorizationRequest.Status.choices)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['changed_at', 'id']


class MissingInformationItem(models.Model):
    class ItemStatus(models.TextChoices):
        PRESENT = 'present', _('Present')
        MISSING = 'missing', _('Missing')
        UPLOADED = 'uploaded', _('Uploaded')

    class ItemSource(models.TextChoices):
        RULES = 'rules', _('Rules')
        AI = 'ai', _('AI')

    authorization_request = models.ForeignKey(
        AuthorizationRequest,
        on_delete=models.CASCADE,
        related_name='missing_information_items',
    )
    item_name = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=ItemStatus.choices, default=ItemStatus.MISSING)
    source = models.CharField(max_length=20, choices=ItemSource.choices, default=ItemSource.RULES)

    class Meta:
        unique_together = [('authorization_request', 'item_name')]
