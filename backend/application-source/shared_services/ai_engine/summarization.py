from .base import get_ai_engine

def summarize_for_authorization(auth_request) -> dict:
    engine = get_ai_engine()
    return engine.summarize_for_authorization(auth_request)
