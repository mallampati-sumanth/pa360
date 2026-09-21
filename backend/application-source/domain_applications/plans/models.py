from django.db import models
from domain_applications.payers.models import Payer

class Plan(models.Model):
    plan_id = models.CharField(max_length=100, primary_key=True)
    plan_name = models.CharField(max_length=255)
    payer = models.ForeignKey(Payer, on_delete=models.CASCADE, related_name='plans')
    pa_rules_summary = models.JSONField(default=dict)
    copay_info = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    effective_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.plan_name} ({self.payer.payer_name})"
