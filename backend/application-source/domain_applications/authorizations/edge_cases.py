import uuid
from .models import AuthorizationRequest
from domain_applications.patients.models import Patient
from shared_services.audit.service import log_action

class EdgeCaseResult:
    def __init__(self, success: bool, message: str, data: dict = None):
        self.success = success
        self.message = message
        self.data = data or {}

def handle_emergency_retro_auth(auth_request: AuthorizationRequest, care_details: dict) -> EdgeCaseResult:
    auth_request.priority = AuthorizationRequest.Priority.EMERGENCY
    auth_request.is_retro_auth = True
    auth_request.retro_auth_reason = care_details.get('reason', 'Emergency care provided')
    auth_request.edge_case_type = AuthorizationRequest.EdgeCaseType.EMERGENCY_RETRO
    auth_request.status = AuthorizationRequest.Status.EXCEPTION
    auth_request.save()
    
    log_action(
        actor=None,
        action="EMERGENCY_RETRO_AUTH_TRIGGERED",
        entity_type="authorization_request",
        entity_id=str(auth_request.authorization_id),
        metadata=care_details
    )
    return EdgeCaseResult(True, "Marked as emergency retro-auth", {"status": auth_request.status})

def handle_newborn_new_enrollee(patient_data: dict, plan) -> Patient:
    patient = Patient.objects.create(
        patient_id=f"PROV_{uuid.uuid4().hex[:8]}",
        name=patient_data.get('name', 'Unknown Newborn'),
        date_of_birth=patient_data.get('date_of_birth'),
        gender=patient_data.get('gender', 'O'),
        plan=plan,
        contact_number=patient_data.get('contact_number', ''),
        address=patient_data.get('address', ''),
        enrollment_status=Patient.EnrollmentStatus.PENDING_ENROLLMENT,
        provisional_record=True,
        insurance_id=None
    )
    log_action(
        actor=None,
        action="PROVISIONAL_PATIENT_CREATED",
        entity_type="patient",
        entity_id=patient.patient_id,
        metadata={"reason": "Newborn/New Enrollee"}
    )
    return patient

def check_coverage_vs_authorization(auth_request: AuthorizationRequest) -> dict:
    is_covered = True
    patient_responsibility = False
    
    if "experimental" in auth_request.clinical_indication.lower():
        is_covered = False
        patient_responsibility = True
        
    auth_request.coverage_verified = is_covered
    if not is_covered:
        auth_request.coverage_notes = "Service is not covered by plan benefits."
        auth_request.edge_case_type = AuthorizationRequest.EdgeCaseType.APPROVED_NOT_COVERED
    auth_request.save()
    
    return {"coverage_verified": is_covered, "patient_responsibility_flag": patient_responsibility}

def handle_denial_appeal(auth_request: AuthorizationRequest, appeal_type: str, reason: str) -> dict:
    auth_request.edge_case_type = AuthorizationRequest.EdgeCaseType.DENIAL_APPEAL
    if appeal_type == 'APPEAL':
        auth_request.appeal_status = AuthorizationRequest.AppealStatus.APPEAL_FILED
    elif appeal_type == 'PEER_TO_PEER':
        auth_request.appeal_status = AuthorizationRequest.AppealStatus.PEER_TO_PEER_REQUESTED
    elif appeal_type == 'EXTERNAL_REVIEW':
        auth_request.appeal_status = AuthorizationRequest.AppealStatus.EXTERNAL_REVIEW_REQUESTED
    
    auth_request.notes += f"\nAppeal Reason: {reason}"
    auth_request.save()
    
    log_action(
        actor=None,
        action="APPEAL_INITIATED",
        entity_type="authorization_request",
        entity_id=str(auth_request.authorization_id),
        metadata={"appeal_type": appeal_type, "reason": reason}
    )
    return {"status": auth_request.appeal_status}

def check_clinical_change(auth_request: AuthorizationRequest, clinical_update: dict) -> dict:
    if auth_request.status == AuthorizationRequest.Status.APPROVED:
        auth_request.clinical_change_detected = True
        auth_request.clinical_change_notes = clinical_update.get('notes', '')
        auth_request.edge_case_type = AuthorizationRequest.EdgeCaseType.CLINICAL_CHANGE
        auth_request.save()
        
        log_action(
            actor=None,
            action="CLINICAL_CHANGE_DETECTED",
            entity_type="authorization_request",
            entity_id=str(auth_request.authorization_id),
            metadata=clinical_update
        )
        return {"re_evaluation_required": True}
    return {"re_evaluation_required": False}

def determine_cob_order(patient: Patient) -> dict:
    if not patient.insurance_id:
        return {"primary": None, "secondary": None}
    
    # Mocking COB logic
    return {
        "primary": patient.plan.payer.payer_name,
        "secondary": "Medicare" if patient.date_of_birth.year < 1958 else None,
        "block_secondary_submission": True
    }
