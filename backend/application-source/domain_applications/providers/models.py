from django.db import models

class Provider(models.Model):
    provider_id = models.CharField(max_length=100, primary_key=True)
    provider_name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    npi_number = models.CharField(max_length=20, unique=True)
    practice_location = models.TextField()
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.provider_name} ({self.npi_number})"
