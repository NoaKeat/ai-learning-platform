# AI-Driven Learning Platform (Mini MVP)

## 📌 Overview
This project is a **production-grade backend MVP** for an AI-driven learning platform.

The platform allows users to:
- Register to the system
- Choose learning categories and sub-categories
- Submit learning prompts
- Receive AI-generated lessons (via AI service abstraction)
- View personal learning history

The focus of this project is **clean architecture, correctness, and robustness**,
rather than UI or feature completeness.

---

## 🎯 Implemented Features
- ✅ User registration with validation
- ✅ Categories & sub-categories (auto-seeded on startup)
- ✅ Prompt submission with stored AI responses
- ✅ User learning history (sorted by creation date)
- ✅ DTO-based API (no domain model exposure)
- ✅ Clear service layer with enforced business rules
- ✅ Unified exception & error-handling strategy
- ✅ Validation pipeline converted to domain exceptions
- ✅ Consistent error responses using ProblemDetails
- ✅ Swagger / OpenAPI documentation
- ✅ Dockerized MySQL database
- ✅ Environment-based configuration (Local / Docker)

---

## 🏗️ Architecture
- **Backend:** ASP.NET Core Web API
- **Database:** MySQL
- **ORM:** Entity Framework Core
- **Architecture Pattern:** Controllers → Services → Data
- **Validation:** DTO validation → Domain exceptions
- **Error Handling:** Global Exception Middleware
- **Containerization:** Docker & Docker Compose
- **API Documentation:** Swagger / OpenAPI

---

## 🧠 Error Handling & Validation
The API uses a **unified error-handling strategy** based on domain exceptions
and a global exception middleware.

All errors are returned using the **ProblemDetails** format:

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/prompts",
  "extensions": {
    "code": "VALIDATION_ERROR",
    "details": {},
    "traceId": "00-acde..."
  }
}
Error Sources
Request validation errors → BadRequestException (400)

Business rule violations → BadRequestException (400)

Missing resources (IDs) → NotFoundException (404)

Database conflicts → 409 Conflict

Unhandled errors → 500 Internal Server Error

This approach ensures consistent, frontend-ready error responses.

🗂️ Project Structure
powershell
Copy code
ai-learning-platform/
├── backend/
│   └── LearningPlatform.Api/
│       ├── Controllers/
│       ├── Services/
│       ├── DTOs/
│       ├── Models/
│       ├── Data/
│       ├── Common/
│       │   ├── Exceptions/
│       │   ├── Middleware/
│       │   └── Filters/
│       ├── Program.cs
│       ├── Dockerfile
│       └── LearningPlatform.Api.csproj
├── docker-compose.yml
├── .env.example
└── README.md
🧱 Database Schema
Tables
Users

id, name, phone

Categories

id, name

SubCategories

id, name, category_id

Prompts

id, user_id, category_id, sub_category_id, prompt, response, created_at

Relationships
Category → many SubCategories

User → many Prompts

Prompt → Category & SubCategory

🧪 Seed Data
On first startup, the database is automatically seeded with:

Science → Space, Biology

Tech → AI, Web Dev

Math → Algebra, Calculus

History → Ancient, Modern

Seeding runs once and is skipped if data already exists.

🐳 Running with Docker
Prerequisites
Docker

Docker Compose

Environment Variables
Create a .env file (not committed):

ini
Copy code
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=learning_platform
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
An example is provided in .env.example.

Build & Run
bash
Copy code
docker compose up --build
Verify
Swagger UI: http://localhost:8080/swagger

MySQL: port 3306 (persistent volume)

🧪 API Endpoints (Summary)
Users
POST /api/users/register

GET /api/users/{id}

Categories
GET /api/categories

GET /api/categories/by-name/{name}

Prompts
POST /api/prompts

GET /api/prompts/history?userId={userId}

⚙️ Configuration Strategy
Local development: appsettings.Development.json

Docker: Environment variables

Database connection adapts automatically by environment

🚀 Future Improvements
Full OpenAI GPT API integration

Authentication & authorization (JWT)

Pagination & filtering

Unit & integration tests

Frontend dashboard (React / Vue)

👩‍💻 Author
Developed as part of an AI-Driven Learning Platform – Mini MVP programming task.

yaml
Copy code

---

# ✅ Commits מומלצים (חדים וברורים)

### 🔹 Commit 1 – סגירת ההיסטוריה + שגיאות (זה ה־MAIN)
```bash
git add .
git commit -m "feat: add user prompt history and unified error handling"