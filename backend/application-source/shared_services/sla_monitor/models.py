from django.db import models
from domain_applications.payers.models import Payer
from domain_applications.authorizations.models import AuthorizationRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class SLAConfiguration(models.Model):
    priority = models.CharField(max_length=20, choices=AuthorizationRequest.Priority.choices)
    payer = models.ForeignKey(Payer, on_delete=models.CASCADE, null=True, blank=True)
    max_hours_to_decision = models.IntegerField(default=72)
    max_hours_to_submit = models.IntegerField(default=24)
    is_active = models.BooleanField(default=True)

class SLABreach(models.Model):
    authorization_request = models.ForeignKey(AuthorizationRequest, on_delete=models.CASCADE, related_name='sla_breaches')
    breach_type = models.CharField(max_length=100)
    breach_detected_at = models.DateTimeField(auto_now_add=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
