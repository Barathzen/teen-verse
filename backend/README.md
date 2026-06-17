# TeenVerse Backend API

A comprehensive mental health assessment platform powered by machine learning and explainable AI (XAI) for teenagers. The backend provides real-time depression risk prediction, behavioral persona classification, what-if scenario analysis, and personalized mental health coaching.

## 🎯 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication
- **Mental Health Assessments**: Comprehensive questionnaire collection
- **Depression Risk Prediction**: XGBoost-based ML model with real-time predictions
- **Explainability**: SHAP-based feature importance analysis
- **Behavioral Personas**: K-Means clustering to identify user patterns
- **What-If Simulations**: Predict impact of lifestyle changes on mental health
- **Analytics Dashboard**: Aggregated metrics and risk distributions
- **Mental Health Chatbot**: AI-powered supportive conversations

### Technical Highlights
- **Framework**: FastAPI with async support
- **Database**: SQLAlchemy ORM (SQLite/PostgreSQL compatible)
- **ML Models**: XGBoost (prediction), K-Means (clustering), SHAP (explainability)
- **Security**: JWT tokens, HTTPBearer authentication, password hashing
- **Validation**: Pydantic models with comprehensive input validation
- **Error Handling**: Detailed error responses with appropriate HTTP status codes

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Virtual environment tool (venv)
- PostgreSQL or SQLite (SQLite included by default)

### Installation

1. **Clone and navigate to backend directory**
```bash
cd Teenverse/backend
```

2. **Create and activate virtual environment**
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
pip install email-validator  # Additional dependency for email validation
```

4. **Set up environment variables**
Create/verify `.env` file:
```
DATABASE_URL=sqlite:///./teenverse.db
SECRET_KEY=your_secret_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-oss-120b
OPENROUTER_HTTP_REFERER=http://localhost:3000
OPENROUTER_APP_TITLE=TeenVerse
```

5. **Create database tables**
```bash
python create_tables.py
```

6. **Start the server**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## 📚 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT token

### Assessments (`/assessment`)
- `POST /assessment/` - Create new mental health assessment
- `GET /assessment/{id}` - Retrieve assessment details

### Predictions (`/prediction`)
- `POST /prediction/` - Generate depression risk prediction
- `GET /prediction/{id}` - Get prediction details
- `GET /prediction/{id}/explain` - Get SHAP explanations

### Simulations (`/simulation`)
- `POST /simulation/` - Run what-if scenario analysis

### Persona (`/persona`)
- `GET /persona/{assessment_id}` - Get behavioral persona classification

### Analytics (`/analytics`)
- `GET /analytics/overview` - Dashboard metrics
- `GET /analytics/risk-distribution` - Risk category distribution
- `GET /analytics/persona-distribution` - Persona distribution

### Chatbot (`/chatbot`)
- `POST /chatbot/` - Mental health coaching chat powered by OpenRouter

## 🔐 Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication.

**Usage:**
```bash
# Get token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Use token in requests
curl -X GET http://localhost:8000/assessment/1 \
  -H "Authorization: Bearer <your_token>"
```

## 📊 Sample Request/Response

### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Create Assessment
```bash
POST /assessment/
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 16,
  "gender": "male",
  "social_media_hours": 5.5,
  "platform_usage": "Instagram",
  "sleep_hours": 7.0,
  "screen_time_before_sleep": 2.0,
  "academic_performance": 3.5,
  "physical_activity": 1.5,
  "stress_level": 6.0,
  "anxiety_level": 4.0,
  "addiction_level": 3.0,
  "social_interaction_level": "medium"
}
```

Response:
```json
{
  "id": 1,
  "user_id": 1,
  "age": 16,
  "gender": "male",
  "social_media_hours": 5.5,
  "platform_usage": "Instagram",
  "sleep_hours": 7.0,
  "screen_time_before_sleep": 2.0,
  "academic_performance": 3.5,
  "physical_activity": 1.5,
  "stress_level": 6.0,
  "anxiety_level": 4.0,
  "addiction_level": 3.0,
  "social_interaction_level": "medium",
  "created_at": "2026-06-12T17:33:17"
}
```

### Get Prediction
```bash
POST /prediction/
Authorization: Bearer <token>
Content-Type: application/json

{
  "assessment_id": 1
}
```

Response:
```json
{
  "risk_score": 35.5,
  "risk_category": "Medium",
  "predicted_label": 1,
  "confidence_score": 0.355
}
```

## 🛠️ Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── assessment.py
│   │   │   ├── simulation.py
│   │   │   ├── persona.py
│   │   │   ├── analytics.py
│   │   │   └── chatbot.py
│   │   ├── deps.py
│   │   └── prediction.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── constants.py
│   ├── models/
│   │   ├── user.py
│   │   ├── assessment.py
│   │   ├── prediction.py
│   │   ├── persona.py
│   │   └── simulation.py
│   ├── schemas/
│   │   ├── auth_schema.py
│   │   ├── assessment_schema.py
│   │   ├── prediction_schema.py
│   │   ├── persona_schema.py
│   │   ├── simulation_schema.py
│   │   └── analytics_schema.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── assessment_service.py
│   │   ├── prediction_service.py
│   │   ├── persona_service.py
│   │   ├── simulation_service.py
│   │   ├── analytics_service.py
│   │   ├── chatbot_service.py
│   │   ├── explainability_service.py
│   │   └── recommendation_service.py
│   ├── ml/
│   │   ├── models/
│   │   │   ├── depression_pipeline.pkl
│   │   │   ├── persona_pipeline.pkl
│   │   │   └── anomaly_pipeline.pkl
│   │   ├── inference/
│   │   ├── training/
│   │   ├── preprocessing/
│   │   └── explainability/
│   ├── utils/
│   │   ├── feature_mapper.py
│   │   ├── response_builder.py
│   │   └── risk_utils.py
│   └── main.py
├── datasets/
│   └── Teen_Mental_Health_Dataset.csv
├── .env
├── requirements.txt
├── create_tables.py
└── README.md
```

## 📦 Dependencies

Core:
- fastapi>=0.136.3
- sqlalchemy>=2.0.0
- pydantic>=2.0.0
- uvicorn>=0.49.0

ML/Data:
- xgboost>=3.0.0
- scikit-learn>=1.0.0
- pandas>=3.0.0
- numpy>=2.0.0
- shap>=0.52.0

Security:
- python-jose>=3.5.0
- python-dotenv>=1.2.0
- passlib>=1.7.0

See `requirements.txt` for complete list.

## 🧠 Machine Learning Models

### Depression Prediction (XGBoost)
- **Model**: `app/ml/models/depression_pipeline.pkl`
- **Type**: Binary classification
- **Features**: 13 behavioral and lifestyle indicators
- **Output**: Risk score (0-100), Risk category, Confidence score

### Persona Clustering (K-Means)
- **Model**: `app/ml/models/persona_pipeline.pkl`
- **Type**: Clustering with 4 personas
- **Personas**: Healthy Balanced, Digital Addict, Academic Burnout, Socially Isolated

### Anomaly Detection (Isolation Forest)
- **Model**: `app/ml/models/anomaly_pipeline.pkl`
- **Type**: Unsupervised anomaly detection
- **Purpose**: Identify high-risk behavioral patterns

### Explainability (SHAP)
- **Type**: TreeExplainer for XGBoost models
- **Output**: Feature importance scores for each prediction

## 🗄️ Database Schema

### users
- id (PRIMARY KEY)
- name
- email (UNIQUE)
- password
- created_at

### assessments
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- age, gender, social_media_hours, platform_usage, sleep_hours, etc.
- created_at

### predictions
- id (PRIMARY KEY)
- assessment_id (FOREIGN KEY)
- risk_score, risk_category, predicted_label, confidence_score
- created_at

### personas
- id (PRIMARY KEY)
- assessment_id (FOREIGN KEY)
- cluster_id, persona_name

### simulations
- id (PRIMARY KEY)
- assessment_id (FOREIGN KEY)
- current_risk, future_risk, modified_* fields
- created_at

## 🔧 Configuration

### Environment Variables (.env)
```
DATABASE_URL=sqlite:///./teenverse.db  # or postgresql://user:pass@localhost/db
SECRET_KEY=your_secret_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-oss-120b
OPENROUTER_HTTP_REFERER=http://localhost:3000
OPENROUTER_APP_TITLE=TeenVerse
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Configuration
- **Default**: SQLite (no setup required)
- **Production**: Configure PostgreSQL in `.env`

## 🧪 Testing

Run the test suite:
```bash
pytest tests/
```

Manual API testing:
```bash
# Health check
curl http://localhost:8000/

# Interactive API docs
http://localhost:8000/docs  # Swagger UI
http://localhost:8000/redoc  # ReDoc
```

## 📈 Performance Considerations

- **Caching**: ML models loaded at startup
- **Async**: All endpoints are async-ready
- **Database**: Indexed primary keys for fast queries
- **Validation**: Input validation reduces downstream errors

## 🔒 Security

- Passwords hashed with PBKDF2-SHA256
- JWT tokens with configurable expiry
- HTTPBearer authentication scheme
- User authorization checks on sensitive endpoints
- Input validation with Pydantic

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Reset database
rm teenverse.db
python create_tables.py
```

### Port Already in Use
```bash
# Use different port
uvicorn app.main:app --port 8001
```

### Authentication Failures
- Ensure token is in Authorization header
- Check token hasn't expired (default: 30 minutes)
- Verify user exists in database

## 📝 API Documentation

Full interactive documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## 📄 License

This project is part of the TeenVerse initiative for mental health awareness.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check database logs: `create_tables.py` output

---

**Status**: ✅ Production Ready

**Last Updated**: 2026-06-12

**Version**: 1.0.0
