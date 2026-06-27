# TeenVerse

<div align="center">
  <p><strong>A Data-Driven Platform for Teenage Mental Health Assessment and Support</strong></p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img alt="Scikit-learn" src="https://img.shields.io/badge/Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" />
  <img alt="OpenRouter" src="https://img.shields.io/badge/OpenRouter_AI-000000?style=for-the-badge&logo=openai&logoColor=white" />
</div>

<br/>

TeenVerse is a comprehensive full-stack application designed to help teenagers monitor and improve their mental wellbeing. By combining daily behavioral metrics (such as screen time, sleep patterns, and physical activity) with advanced natural language processing, the platform provides accurate mental health risk assessments, actionable lifestyle simulations, and conversational support.

---

## Core Features

### Hybrid Assessments
Standard mental health forms are often rigid and prone to survey fatigue. TeenVerse utilizes a hybrid assessment model. Users provide hard metrics (age, sleep hours, etc.) manually, while conversational language models extract complex psychological markers (stress, anxiety) through a dynamic, responsive questionnaire.

### Machine Learning Risk Prediction
The system evaluates assessment data using trained Scikit-Learn models (Random Forest). It calculates an overall risk score, identifies contributing behavioral factors, and categorizes the user's mental state to provide targeted intervention strategies.

### Lifestyle Simulation Engine
A predictive simulation environment allows users to adjust their behavioral metrics (e.g., reducing daily social media usage by two hours) and instantly see the projected impact on their mental health risk score. 

### Interactive Support Assistant
An integrated conversational interface offers users an accessible, empathetic support system. It is designed to validate feelings, offer evidence-based coping mechanisms, and encourage positive behavioral changes.

### Centralized Analytics Dashboard
Users can track their historical risk scores and behavioral trends through interactive data visualizations. System administrators have access to aggregated metrics for global platform monitoring and user management.

---

## System Architecture

TeenVerse is built on a modern, decoupled architecture. The Next.js frontend handles state and UI rendering, while the FastAPI backend serves as the orchestration layer for database transactions, machine learning inferences, and external LLM integrations.

```mermaid
graph TD
    %% Frontend Components
    subgraph Client [Frontend - Next.js]
        UI[User Interface]
        AuthStore[Zustand Auth Store]
        AssessStore[Zustand Data Store]
        Axios[Axios API Client]
        
        UI <--> AuthStore
        UI <--> AssessStore
        AuthStore <--> Axios
        AssessStore <--> Axios
    end

    %% Backend Components
    subgraph Server [Backend - FastAPI]
        Router[API Routers]
        AuthService[Auth & Security]
        MLService[Scikit-Learn ML Models]
        LLMService[LLM Integration Engine]
        DBService[SQLAlchemy ORM]

        Router --> AuthService
        Router --> MLService
        Router --> LLMService
        Router --> DBService
    end

    %% External Services
    subgraph External [External Services]
        Firebase[Firebase Authentication]
        OpenRouter[OpenRouter LLM API]
        Postgres[(PostgreSQL Database)]
    end

    %% Connections
    Axios -- REST API --> Router
    AuthStore -- OAuth Tokens --> Firebase
    AuthService -- Verify/Sync --> Firebase
    LLMService -- Prompts/Completion --> OpenRouter
    DBService -- Read/Write --> Postgres
```

### Assessment Data Flow

The assessment pipeline merges explicit user inputs with implicit psychological markers extracted via Large Language Models.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FastAPI
    participant LLM as OpenRouter (LLM)
    participant ML as Risk Model (RF)
    participant DB as PostgreSQL

    User->>Frontend: Enter Hard Metrics (Sleep, Screen Time)
    Frontend->>FastAPI: Request Conversational Questions
    FastAPI->>LLM: Generate 5 Contextual Questions
    LLM-->>FastAPI: Return Questions
    FastAPI-->>Frontend: Display Questions
    User->>Frontend: Submit Natural Language Answers
    Frontend->>FastAPI: POST /assessment (Metrics + Answers)
    
    FastAPI->>LLM: Extract Stress, Anxiety, Addiction from Answers
    LLM-->>FastAPI: Structured Psychological Metrics
    
    FastAPI->>ML: Predict Overall Risk Score
    ML-->>FastAPI: Risk Score & Contributing Factors
    
    FastAPI->>DB: Save Complete Assessment Record
    DB-->>FastAPI: Confirmation
    FastAPI-->>Frontend: Assessment Results & Dashboard Update
```

---

## Technology Stack

**Client Application:**
- **Framework:** Next.js (React 18, App Router)
- **Styling:** Tailwind CSS (Dark/Light mode support)
- **State Management:** Zustand
- **Data Fetching:** Axios
- **Data Visualization:** Recharts

**Server Application:**
- **Framework:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL (with SQLAlchemy ORM)
- **Machine Learning:** Scikit-Learn, Pandas, NumPy
- **Generative AI Integration:** OpenRouter API
- **Authentication:** PyJWT, Passlib, Firebase Admin SDK

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (3.10 or higher)
- PostgreSQL database
- OpenRouter API Key
- Firebase Project configured for Google Authentication

### Backend Configuration (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables by creating a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/teenverse
   SECRET_KEY=your_secure_jwt_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
5. Initialize the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Configuration (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables by creating a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Access the application at [http://localhost:3000](http://localhost:3000).

---

## License

This project is distributed under the MIT License. See the `LICENSE` file for more details.
