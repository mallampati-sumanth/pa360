# ADR-001: Use Snowflake as the Single Application Data Store

## Status
Accepted

## Context
Sprint 1 design left the database choice as TBD. The Calibo POD-NOVA team resolved this to Snowflake during Sprint 1 completion.

## Decision
Use Snowflake as the sole application database, accessed by Django via the django-snowflake ORM backend. Calibo DPS Studio is the exclusive path for writing newly-cleaned external data into Snowflake. Django reads and writes the CURATED schema directly for application traffic.

## Consequences
- Pro: Single source of truth; no data sync between OLTP and analytical store
- Pro: Native support for semi-structured data (VARIANT type for JSON fields)
- Pro: Snowflake Time Travel provides built-in audit/recovery capability
- Con: django-snowflake does not support all Django ORM features (e.g., complex aggregations may need raw SQL)
- Con: Snowflake connection latency higher than local RDBMS — mitigated by connection pooling
- Mitigation: Use django.test.TestCase with SQLite backend for unit tests to avoid Snowflake cost during CI
