from celery import shared_task
from django.utils import timezone
from .models import SLABreach
from domain_applications.authorizations.models import AuthorizationRequest

@shared_task
def scan_for_sla_breaches():
    pass
