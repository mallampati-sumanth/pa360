from django.utils import timezone
from .models import AuthorizationRequest, AuthorizationStatusHistory
from shared_services.audit.service import log_action

VALID_TRANSITIONS = {
    AuthorizationRequest.Status.DRAFT: [AuthorizationRequest.Status.READY_FOR_SUBMISSION, AuthorizationRequest.Status.EXCEPTION],
    AuthorizationRequest.Status.READY_FOR_SUBMISSION: [AuthorizationRequest.Status.SUBMITTED, AuthorizationRequest.Status.DRAFT],
    AuthorizationRequest.Status.SUBMITTED: [AuthorizationRequest.Status.PENDING, AuthorizationRequest.Status.APPROVED, AuthorizationRequest.Status.DENIED, AuthorizationRequest.Status.ADDITIONAL_INFO_REQUESTED],
    AuthorizationRequest.Status.PENDING: [AuthorizationRequest.Status.COVERAGE_VALIDATION, AuthorizationRequest.Status.APPROVED, AuthorizationRequest.Status.DENIED, AuthorizationRequest.Status.ADDITIONAL_INFO_REQUESTED],
    AuthorizationRequest.Status.ADDITIONAL_INFO_REQUESTED: [AuthorizationRequest.Status.READY_FOR_SUBMISSION, AuthorizationRequest.Status.SUBMITTED],
    AuthorizationRequest.Status.COVERAGE_VALIDATION: [AuthorizationRequest.Status.APPROVED, AuthorizationRequest.Status.DENIED],
    AuthorizationRequest.Status.APPROVED: [AuthorizationRequest.Status.SERVICE_DELIVERY],
    AuthorizationRequest.Status.SERVICE_DELIVERY: [AuthorizationRequest.Status.BILLING_RCM],
    AuthorizationRequest.Status.EXCEPTION: [AuthorizationRequest.Status.DRAFT, AuthorizationRequest.Status.READY_FOR_SUBMISSION],
}

def advance_workflow(auth_request: AuthorizationRequest, new_status: str, user, metadata=None) -> bool:
    if new_status not in VALID_TRANSITIONS.get(auth_request.status, []):
        raise ValueError(f"Invalid transition from {auth_request.status} to {new_status}")
    
    before_state = {"status": auth_request.status}
    auth_request.status = new_status
    
    if new_status == AuthorizationRequest.Status.SUBMITTED and not auth_request.submission_date:
        auth_request.submission_date = timezone.now().date()
    elif new_status in [AuthorizationRequest.Status.APPROVED, AuthorizationRequest.Status.DENIED]:
        auth_request.decision_date = timezone.now().date()
        
    if not getattr(auth_request._state, 'adding', False):
        auth_request.save()
        AuthorizationStatusHistory.objects.create(
            authorization_request=auth_request,
            status=new_status,
            changed_by=user,
        )
    after_state = {"status": auth_request.status}
    
    log_action(
        actor=user,
        action="STATUS_CHANGED",
        entity_type="authorization_request",
        entity_id=str(auth_request.authorization_id),
        before_state=before_state,
        after_state=after_state,
        metadata=metadata
    )
    return True

def get_available_actions(auth_request: AuthorizationRequest, user_role: str) -> list:
    if user_role not in ['AUTHORIZATION_SPECIALIST', 'OPS_MANAGER']:
        return []
    return VALID_TRANSITIONS.get(auth_request.status, [])
