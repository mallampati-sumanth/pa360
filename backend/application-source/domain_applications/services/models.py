from django.db import models

class Service(models.Model):
    service_code = models.CharField(max_length=50, primary_key=True)
    service_name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    authorization_required = models.BooleanField(default=True)
    typical_duration_days = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.service_code} - {self.service_name}"
