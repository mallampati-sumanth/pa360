from django.db import models

class Payer(models.Model):
    payer_id = models.CharField(max_length=100, primary_key=True)
    payer_name = models.CharField(max_length=255)
    contact_info = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ingestion_timestamp = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.payer_name
