from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class RequirementResult:
    is_required: bool
    needs_review: bool
    reason: str

    @property
    def outcome(self) -> str:
        if self.needs_review:
            return 'NEEDS_REVIEW'
        return 'REQUIRED' if self.is_required else 'NOT_REQUIRED'

@dataclass
class RequiredField:
    field_name: str
    description: str

@dataclass
class CompletenessResult:
    is_complete: bool
    missing_fields: List[str]
    has_conflicts: bool
    conflict_details: str = ""

def check_pa_requirement(payer, plan, service, patient_context) -> RequirementResult:
    plan_rules = plan.pa_rules_summary if isinstance(plan.pa_rules_summary, dict) else {}
    if service.service_code in plan_rules.get('exempt_services', []):
        return RequirementResult(is_required=False, needs_review=False, reason="Service is exempt under this plan.")
    
    if patient_context.get('is_emergency'):
        return RequirementResult(is_required=True, needs_review=True, reason="Emergency case, requires review.")

    if service.authorization_required:
        return RequirementResult(is_required=True, needs_review=False, reason="Service is flagged as requiring prior authorization.")
    
    return RequirementResult(is_required=False, needs_review=False, reason="Service is not flagged as requiring prior authorization.")

def get_required_information(payer, plan, service) -> List[RequiredField]:
    required = [
        RequiredField("diagnosis", "ICD-10 Diagnosis Code"),
        RequiredField("clinical_indication", "Detailed clinical indication"),
        RequiredField("provider", "Ordering Provider"),
    ]
    if service.service_code.startswith("S"):
        required.append(RequiredField("supporting_document", "Relevant clinical notes"))
    return required

def check_completeness(auth_request) -> CompletenessResult:
    missing = []
    
    if not getattr(auth_request, 'patient', None):
        missing.append("patient_info")
    if not getattr(auth_request, 'payer', None) or not getattr(auth_request, 'plan', None):
        missing.append("insurance_info")
    if not getattr(auth_request, 'provider', None):
        missing.append("ordering_provider")
    if not getattr(auth_request, 'diagnosis', None):
        missing.append("diagnosis")
    if not getattr(auth_request, 'clinical_indication', None):
        missing.append("clinical_indication")
    
    # Check documents
    docs = auth_request.documents.all() if hasattr(auth_request, 'documents') else []
    if not docs:
        missing.append("clinical_note")
        missing.append("supporting_document")
    
    auth_request.missing_information = missing
    if hasattr(auth_request, 'save') and getattr(auth_request, 'pk', None):
        auth_request.save(update_fields=['missing_information'])
        from .models import MissingInformationItem
        for item_name in missing:
            MissingInformationItem.objects.update_or_create(
                authorization_request=auth_request,
                item_name=item_name,
                defaults={'status': MissingInformationItem.ItemStatus.MISSING},
            )

    if missing:
        return CompletenessResult(is_complete=False, missing_fields=missing, has_conflicts=False)
    
    return CompletenessResult(is_complete=True, missing_fields=[], has_conflicts=False)

def should_route_to_human(completeness_result: CompletenessResult, ai_confidence_score: float = None) -> Tuple[bool, str]:
    if completeness_result.has_conflicts:
        return True, "Data conflicts detected."
    if not completeness_result.is_complete:
        return True, "Incomplete information."
    if ai_confidence_score is not None and ai_confidence_score < 0.75:
        return True, f"Low AI confidence score: {ai_confidence_score}."
    return False, ""
