from .base import get_ai_engine

def extract_document(document_text: str) -> dict:
    engine = get_ai_engine()
    return engine.extract_document(document_text)
