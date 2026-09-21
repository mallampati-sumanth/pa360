from abc import ABC, abstractmethod
from typing import Any
from django.conf import settings

class AIEngineBase(ABC):
    @abstractmethod
    def extract_document(self, document_text: str) -> dict: pass
    
    @abstractmethod
    def summarize_for_authorization(self, auth_request) -> dict: pass
    
    @abstractmethod
    def detect_missing_info(self, auth_request, required_fields) -> dict: pass
    
    @abstractmethod
    def score_confidence(self, extraction_result) -> float: pass
    
    @abstractmethod
    def interpret_payer_requirements(self, requirements_text) -> dict: pass
    
    @abstractmethod
    def prepopulate_request(self, patient, service, documents) -> dict: pass
    
    @abstractmethod
    def interpret_payer_response(self, response_text, response_type) -> dict: pass

class StubAIEngine(AIEngineBase):
    def extract_document(self, document_text: str) -> dict:
        return {"extracted_fields": ["diagnosis: E11.9", "service: 99214"]}
        
    def summarize_for_authorization(self, auth_request) -> dict:
        return {"summary": "Patient has a history of type 2 diabetes. Requesting office visit."}
        
    def detect_missing_info(self, auth_request, required_fields) -> dict:
        return {"missing_fields": [], "severity": "INFO"}
        
    def score_confidence(self, extraction_result) -> float:
        return 0.85
        
    def interpret_payer_requirements(self, requirements_text) -> dict:
        return {"required_fields": ["clinical_notes", "lab_results"]}
        
    def prepopulate_request(self, patient, service, documents) -> dict:
        return {"diagnosis": "E11.9", "priority": "ROUTINE"}
        
    def interpret_payer_response(self, response_text, response_type) -> dict:
        return {"actionable_steps": ["Submit additional clinical notes"]}

def get_ai_engine() -> AIEngineBase:
    provider = getattr(settings, 'AI_PROVIDER', 'stub')
    if provider == 'stub':
        return StubAIEngine()
    # Add other providers here later
    return StubAIEngine()
