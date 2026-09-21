# PA360 Database Migration Strategy

## Overview
This document outlines the database migration and management strategy for the PA360 Application, specifically dealing with the interaction between Django and Snowflake.

## Django Models (Source of Truth)
- Django models are the absolute source of truth for the structure of tables residing in the `PA360_DEV.CURATED` schema.
- To apply structural changes, developers should update the Django models and create standard Django migrations (`python manage.py makemigrations`).
- Run `python manage.py migrate` to apply Django migrations to Snowflake. The custom Snowflake database backend for Django handles the translation of DDL.
- The initial migration will create all 8 primary domain tables within the `CURATED` schema.

## External Data Layers (DPS Studio)
- Tables in the `RAW` and `STAGING` schemas are strictly managed outside of Django.
- DPS Studio is responsible for raw data ingestion and staging transformations.
- Django migrations **should not** manage or modify the structure of the `RAW` or `STAGING` layers.

## Rollback Strategy
- In the event of a catastrophic data issue or incorrect migration applied to Snowflake, we rely on **Snowflake TIME TRAVEL** for robust data recovery.
- Reversing Django migrations (e.g., `migrate app_name <previous_migration>`) is possible for structural rollbacks, but Time Travel allows immediate restoral of data states from prior to the migration error.
