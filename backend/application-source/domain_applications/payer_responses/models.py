import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from domain_applications.authorizations.models import AuthorizationRequest
from domain_applications.payers.models import Payer

class PayerResponse(models.Model):
    class ResponseType(models.TextChoices):
        ACKNOWLEDGMENT = 'ACKNOWLEDGMENT', _('Acknowledgment')
        APPROVED = 'APPROVED', _('Approved')
        PENDING = 'PENDING', _('Pending')
        ADDITIONAL_INFO_REQUESTED = 'ADDITIONAL_INFO_REQUESTED', _('Additional Info Requested')
        DENIED = 'DENIED', _('Denied')

    response_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    authorization_request = models.ForeignKey(AuthorizationRequest, on_delete=models.CASCADE, related_name='payer_responses')
    payer = models.ForeignKey(Payer, on_delete=models.CASCADE, related_name='responses')
    payer_name = models.CharField(max_length=255)
    
    response_type = models.CharField(max_length=50, choices=ResponseType.choices)
    response_date = models.DateTimeField()
    response_text = models.TextField()
    raw_response_data = models.JSONField()
    
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    ai_interpretation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.response_type} for {self.authorization_request_id}"
