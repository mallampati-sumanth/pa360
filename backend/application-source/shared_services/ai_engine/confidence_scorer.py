from .base import get_ai_engine

def score_confidence(extraction_result) -> float:
    engine = get_ai_engine()
    return engine.score_confidence(extraction_result)
