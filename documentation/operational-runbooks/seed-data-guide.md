# Seed Data Guide

This guide explains how to populate the database with seed data for testing and development.

## Running Seed Data

### Local SQLite workbook load

The local application reads the workbook through Django and writes cleaned records to `db.sqlite3`.
The browser never reads the Excel file directly.

1. Put `Prior_Auth_Data_Dirty_Intern_Enhanced_ID_Ref_Variants.xlsx` somewhere accessible, for example:
   `database/demo-data/Prior_Auth_Data_Dirty_Intern_Enhanced_ID_Ref_Variants.xlsx`.
2. From `backend/application-source`, create the local tables and load the workbook:

   ```powershell
   python manage.py migrate --run-syncdb
   python manage.py load_demo_workbook "../../database/demo-data/Prior_Auth_Data_Dirty_Intern_Enhanced_ID_Ref_Variants.xlsx" --replace
   ```

3. Start Django and Next.js normally. Selecting a patient in **New Authorization** fetches the patient
   record from Django, resolves the linked plan and payer, and prioritizes providers previously used
   for that patient. Provider selection remains independent and can be changed by the specialist.

The loader trims whitespace, normalizes pseudo-null values, normalizes gender/status/priority values,
parses supported date formats, and converts service authorization flags to the local boolean model.

1. **Run the Python seed data generator:**
   Generates a raw SQL file with inserts.
   ```bash
   python database/analytical-warehouse/seed-data/generate_seed_data.py > seed.sql
   ```

2. **Execute in Snowflake:**
   Run the generated SQL script using SnowSQL.
   ```bash
   snowsql -f seed.sql
   ```

3. **Load Django fixtures:**
   Loads reference data, test users, and configuration objects.
   ```bash
   python manage.py loaddata database/analytical-warehouse/seed-data/seed_fixtures.json
   ```

## What the Seed Data Contains

| Entity | Count | Coverage Scenarios |
|--------|-------|--------------------|
| Users (Roles) | 4 | Authorization Specialist, Provider, Billing, Ops Manager |
| Patients | 50 | Mix of demographics, active/inactive statuses |
| Providers | 20 | PCPs and Specialists, cross-facility |
| Payers | 5 | Major commercial and Medicare/Medicaid plans |
| Plans | 15 | HMO, PPO, EPO with attached PA rules |
| Services | 100 | Common CPT/HCPCS codes with varying PA requirements |
| Auth Requests | 200 | All statuses: PENDING, APPROVED, DENIED, APPEALED, etc. |
| Documents | 300 | Mock clinical notes, imaging reports, lab results |

## Verifying Seed Data

To verify that the seed data was loaded correctly, you can run the following sample queries in Snowflake:
```sql
SELECT COUNT(*) FROM PA360_DEV.CURATED.PATIENTS;
SELECT status, COUNT(*) FROM PA360_DEV.CURATED.AUTHORIZATION_REQUESTS GROUP BY status;
```
