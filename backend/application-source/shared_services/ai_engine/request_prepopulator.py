from .base import get_ai_engine

def prepopulate_request(patient, service, documents) -> dict:
    engine = get_ai_engine()
    return engine.prepopulate_request(patient, service, documents)
