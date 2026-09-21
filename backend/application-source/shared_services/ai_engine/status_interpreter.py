from .base import get_ai_engine

def interpret_payer_response(response_text, response_type) -> dict:
    engine = get_ai_engine()
    return engine.interpret_payer_response(response_text, response_type)
