import os
import snowflake.connector
from snowflake.sqlalchemy import URL
from sqlalchemy import create_engine

def get_snowflake_connection():
    """Get a raw Snowflake connector connection using environment variables.
    Used for DPS Studio scripts and admin tasks outside Django ORM.
    For Django ORM access, use the django-snowflake backend configured in settings.
    """
    return snowflake.connector.connect(
        account=os.environ['SNOWFLAKE_ACCOUNT'],
        user=os.environ['SNOWFLAKE_USER'],
        password=os.environ['SNOWFLAKE_PASSWORD'],
        database=os.environ['SNOWFLAKE_DATABASE'],
        schema=os.environ['SNOWFLAKE_SCHEMA'],
        warehouse=os.environ['SNOWFLAKE_WAREHOUSE'],
        role=os.environ.get('SNOWFLAKE_ROLE', 'PA360_APP_USER'),
    )

def get_snowflake_engine():
    """Get SQLAlchemy engine for Snowflake (for pandas/data operations)."""
    url = URL(
        account=os.environ['SNOWFLAKE_ACCOUNT'],
        user=os.environ['SNOWFLAKE_USER'],
        password=os.environ['SNOWFLAKE_PASSWORD'],
        database=os.environ['SNOWFLAKE_DATABASE'],
        schema=os.environ['SNOWFLAKE_SCHEMA'],
        warehouse=os.environ['SNOWFLAKE_WAREHOUSE'],
        role=os.environ.get('SNOWFLAKE_ROLE', 'PA360_APP_USER'),
    )
    return create_engine(url)
