# Local Demo Data

These CSV files are exported from `Prior_Auth_Data_Dirty_Intern_Enhanced_ID_Ref_Variants.xlsx` and provide local mock data for the PA360 tables. The Django local database is seeded with:

```powershell
$env:PA360_DATABASE = 'sqlite'
python backend/application-source/manage.py migrate --run-syncdb
python backend/application-source/manage.py load_demo_workbook C:/path/to/Prior_Auth_Data_Dirty_Intern_Enhanced_ID_Ref_Variants.xlsx --replace
```

The CSVs retain the workbook headers and dirty values so cleaning and referential-integrity behavior can be tested locally. Snowflake remains available through the default database configuration.
