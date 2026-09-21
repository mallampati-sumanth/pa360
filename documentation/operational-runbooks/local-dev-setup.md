# Local Development Setup Guide

## Prerequisites
- Python 3.12+
- Node.js 20+
- Docker + Docker Compose
- Snowflake account (with credentials)

## 1. Clone the repository
```bash
git clone <repository-url>
cd PA360-PRIORAUTH-NOVA
```

## 2. Backend Setup
```bash
cd backend/application-source
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../../.env.example .env
# Edit .env with your Snowflake credentials

python manage.py migrate
python manage.py loaddata database/analytical-warehouse/seed-data/seed_fixtures.json
python manage.py createsuperuser
python manage.py runserver
```

## 3. Frontend Setup
```bash
cd frontend/applications/member-portal
npm install
cp ../../../.env.example .env.local
npm run dev
```

## 4. Docker Compose Alternative
From the root directory:
```bash
docker-compose up --build
```

## 5. Verify Setup
- Open http://localhost:3000 in your browser
- Login with the test credentials provided in the seed data
- Access the API documentation at http://localhost:8000/api/v1/schema/ui/

## Common Issues
- **Snowflake connection timeout**: Ensure your network allows outbound connections to Snowflake.
- **Node-sass error**: Ensure you are using Node 20. Older versions might have compatibility issues.
