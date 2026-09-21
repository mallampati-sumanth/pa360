# System Architecture

## 1. System Overview
PA360 is an intelligent prior authorization platform designed to streamline the authorization workflow by integrating business rules, AI-driven document analysis, and human-in-the-loop review processes.

## 2. Component Architecture Diagram
```mermaid
flowchart TD
    Client[Next.js Frontend] -->|HTTPS/REST| API[Django REST API]
    API --> Auth[JWT Authentication]
    API --> Rules[Deterministic Rules Engine]
    API --> AI[AI Engine Services]
    API --> ORM[Django ORM]
    
    ORM -->|django-snowflake| DB[(Snowflake CURATED)]
    
    API --> Celery[Celery Task Queue]
    Celery --> Redis[(Redis Broker)]
    Celery --> Worker[Celery Workers]
    Worker --> AI
    Worker --> DB
```

## 3. Data Flow Diagram
- Providers submit Auth Requests and Upload Documents via the Frontend.
- Requests pass through the API to the DB.
- Async tasks trigger the Rules Engine and AI Engine to pre-process requests.
- Results are stored in the DB and status updates are sent to the Frontend.

## 4. Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB
    User->>Frontend: Login(credentials)
    Frontend->>API: POST /auth/login
    API->>DB: Validate User
    DB-->>API: User Valid
    API-->>Frontend: JWT Access + Refresh Tokens
    Frontend->>API: API Request + Bearer Token
    API-->>Frontend: Protected Data
```

## 5. 12-Step PA Workflow
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED: Submit Request
    SUBMITTED --> PENDING_REVIEW: Rules & AI Processing
    PENDING_REVIEW --> PENDING_INFO: Missing Info Detected
    PENDING_INFO --> PENDING_REVIEW: Info Provided
    PENDING_REVIEW --> APPROVED: Auto or Manual Approval
    PENDING_REVIEW --> DENIED: Manual Denial
    DENIED --> APPEALED: Appeal Filed
    APPEALED --> APPROVED
    APPEALED --> DENIED_FINAL
    APPROVED --> [*]
    DENIED_FINAL --> [*]
```

## 6. AI Engine Architecture
The AI Engine uses foundational models (via OpenAI/Gemini APIs) wrapped with a confidence scoring layer. It extracts key entities from documents and matches them against required clinical criteria, passing uncertain predictions to human specialists.

## 7. Edge Case Routing
- Emergency/Retro-Auth: Expedited routing skipping initial standard wait times.
- Newborn/New-Enrollee: Bypasses standard eligibility checks if provisional data is linked.
- Approved-Not-Covered / Denial-Appeal / Clinical-Change / COB: Specialized exception queues.

## 8. Technology Stack Table
| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind |
| Backend | Django 5.2, DRF, Celery |
| Database | Snowflake |
| Caching/Queue | Redis |
| AI | LangChain / Foundation Models |
