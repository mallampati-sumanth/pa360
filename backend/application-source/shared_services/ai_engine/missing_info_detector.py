from .base import get_ai_engine

def detect_missing_info(auth_request, required_fields) -> dict:
    engine = get_ai_engine()
    return engine.detect_missing_info(auth_request, required_fields)
