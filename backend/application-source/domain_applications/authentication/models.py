from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        AUTHORIZATION_SPECIALIST = 'AUTHORIZATION_SPECIALIST', _('Authorization Specialist')
        PROVIDER = 'PROVIDER', _('Provider')
        BILLING = 'BILLING', _('Billing')
        OPS_MANAGER = 'OPS_MANAGER', _('Ops Manager')

    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.AUTHORIZATION_SPECIALIST,
    )
    department = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} - {self.role}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    extra_attributes = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Profile for {self.user.username}"
