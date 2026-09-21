from .base import get_ai_engine

def interpret_payer_requirements(requirements_text) -> dict:
    engine = get_ai_engine()
    return engine.interpret_payer_requirements(requirements_text)
