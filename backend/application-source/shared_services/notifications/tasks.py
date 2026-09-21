from celery import shared_task
from .service import NotificationService

@shared_task
def notify_specialist_of_missing_info(auth_request_id, specialist_id):
    pass

@shared_task
def notify_of_payer_response(auth_request_id):
    pass

@shared_task
def notify_sla_breach(breach_id):
    pass

@shared_task
def notify_exception_created(auth_request_id):
    pass
