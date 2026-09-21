import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from domain_applications.authorizations.models import AuthorizationRequest

User = get_user_model()

class AuthorizationDocument(models.Model):
    class DocumentType(models.TextChoices):
        CLINICAL_NOTES = 'CLINICAL_NOTES', _('Clinical Notes')
        DIAGNOSIS_REPORT = 'DIAGNOSIS_REPORT', _('Diagnosis Report')
        LAB_RESULTS = 'LAB_RESULTS', _('Lab Results')
        IMAGING = 'IMAGING', _('Imaging')
        PRIOR_TREATMENT = 'PRIOR_TREATMENT', _('Prior Treatment')
        REFERRAL_LETTER = 'REFERRAL_LETTER', _('Referral Letter')
        OTHER = 'OTHER', _('Other')

    class ExtractionStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')

    document_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    authorization_request = models.ForeignKey(AuthorizationRequest, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DocumentType.choices, default=DocumentType.OTHER)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.IntegerField()
    mime_type = models.CharField(max_length=100)
    
    extracted_text = models.TextField(blank=True)
    extraction_status = models.CharField(max_length=50, choices=ExtractionStatus.choices, default=ExtractionStatus.PENDING)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.file_name
