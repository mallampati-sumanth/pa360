# Calibo Platform Production Deployment Notes

## Environment Variables to set in Calibo Secrets
- `DJANGO_SECRET_KEY` (must be 50+ chars secure string)
- `DJANGO_DEBUG` = False
- `DJANGO_ALLOWED_HOSTS` = your-production-domain.com
- `DJANGO_SETTINGS_MODULE` = project_config.settings.production
- `SNOWFLAKE_ACCOUNT`
- `SNOWFLAKE_USER`
- `SNOWFLAKE_PASSWORD`
- `SNOWFLAKE_DATABASE` = PA360_PROD
- `SNOWFLAKE_SCHEMA` = CURATED
- `SNOWFLAKE_WAREHOUSE` = PA360_WH
- `SNOWFLAKE_ROLE` = PA360_APP_USER
- `REDIS_URL`
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

## Deployment Checklist
1. Verify Snowflake production schema is populated via Calibo DPS
2. Ensure Calibo environment promotion sets the required secrets
3. Run Django migrations and static collection step
4. Deploy the frontend and point `NEXT_PUBLIC_API_BASE_URL` to production backend
5. Verify SSL/TLS certificates and load balancers via Calibo Platform
