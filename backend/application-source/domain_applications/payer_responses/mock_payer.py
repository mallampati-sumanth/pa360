import uuid
import random
from django.utils import timezone
from .models import PayerResponse
from domain_applications.authorizations.models import AuthorizationRequest
from shared_services.audit.service import log_action

class MockPayerSubmissionResult:
    def __init__(self, reference_number: str):
        self.reference_number = reference_number

def submit_to_payer(auth_request: AuthorizationRequest) -> MockPayerSubmissionResult:
    ref_num = f"PAYER_{uuid.uuid4().hex[:8].upper()}"
    log_action(
        actor=None,
        action="SUBMITTED_TO_PAYER",
        entity_type="authorization_request",
        entity_id=str(auth_request.authorization_id),
        metadata={"reference_number": ref_num}
    )
    return MockPayerSubmissionResult(ref_num)

def simulate_payer_response(authorization_id: str, delay_seconds: int = 5) -> PayerResponse:
    auth_req = AuthorizationRequest.objects.get(authorization_id=authorization_id)
    
    if auth_req.priority == AuthorizationRequest.Priority.EMERGENCY:
        resp_type = PayerResponse.ResponseType.APPROVED
        text = "Approved due to emergency."
    else:
        rand = random.random()
        if rand < 0.6:
            resp_type = PayerResponse.ResponseType.APPROVED
            text = "Service is approved."
        elif rand < 0.8:
            resp_type = PayerResponse.ResponseType.PENDING
            text = "Under review."
        elif rand < 0.9:
            resp_type = PayerResponse.ResponseType.DENIED
            text = "Service denied. Not medically necessary."
        else:
            resp_type = PayerResponse.ResponseType.ADDITIONAL_INFO_REQUESTED
            text = "Please provide additional clinical notes."
            
    response = PayerResponse.objects.create(
        authorization_request=auth_req,
        payer=auth_req.payer,
        payer_name=auth_req.payer.payer_name,
        response_type=resp_type,
        response_date=timezone.now(),
        response_text=text,
        raw_response_data={"status": resp_type, "message": text}
    )
    
    log_action(
        actor=None,
        action="PAYER_RESPONSE_RECEIVED",
        entity_type="authorization_request",
        entity_id=str(auth_req.authorization_id),
        metadata={"response_type": resp_type}
    )
    
    return response
