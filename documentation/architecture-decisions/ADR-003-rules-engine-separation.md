# ADR-003: Separate Deterministic Rules Engine from AI/GenAI Layer

## Status
Accepted

## Context
PA360 must determine PA requirements, check information completeness, and route exceptions. Two approaches: embed all logic in an AI model, or maintain a separate deterministic rules engine.

## Decision
Maintain a strict separation:
1. Deterministic Rules Engine (authorizations/rules_engine.py): pure Python, no ML, fully unit-testable, auditable. Handles Category 1-4 rules.
2. AI Engine (shared-services/ai_engine/): document understanding, summarization, confidence scoring. AI sits NEXT TO the rules engine, not inside it.

A deterministic rule result is never silently replaced by an AI prediction. Low-confidence AI results route to human review.

## Consequences
- Rules engine is independently auditable (regulatory requirement for healthcare)
- AI can be upgraded or replaced without touching business rules
- Human review loop is always triggered for AI-uncertain cases
- Dual-layer means some redundancy in checking, accepted as a safety feature
