AI-Driven Learning Platform (Mini MVP)
📌 Overview

This project is a full-stack Mini MVP for an AI-driven learning platform, built with a production-grade backend and a modern React frontend.

The platform allows users to:

Register to the system

Choose learning categories and sub-categories

Submit learning prompts

Receive AI-generated lessons (via AI service abstraction)

View their personal learning history

The project emphasizes clean architecture, correctness, robustness, and clear separation of concerns, rather than feature bloat.

🎯 Implemented Features
🔧 Backend (ASP.NET Core)

✅ User registration with validation

✅ Categories & sub-categories (auto-seeded on startup)

✅ Prompt submission with stored AI responses

✅ User learning history (sorted by creation date)

✅ DTO-based API (no domain model exposure)

✅ Clear service layer with enforced business rules

✅ Unified exception & error-handling strategy

✅ Validation pipeline converted to domain exceptions

✅ Consistent error responses using ProblemDetails

✅ Swagger / OpenAPI documentation

✅ Dockerized MySQL database

✅ Environment-based configuration (Local / Docker)

🎨 Frontend (React)

✅ Complete React client application

✅ Registration (Sign-Up) flow with validation

✅ Protected learning dashboard (route guards)

✅ Category & sub-category selection

✅ Prompt submission and AI response display

✅ User learning history with details modal

✅ Controlled form state and safe side-effects

✅ Basic responsive UI and layout

✅ Clean API integration with backend

✅ Centralized user state via localStorage utilities

✅ Reactive authentication flow (login/logout without page refresh)


⚠️ Frontend Dockerization is planned but intentionally deferred to a follow-up step.

🏗️ Architecture
Backend

Framework: ASP.NET Core Web API

Database: MySQL

ORM: Entity Framework Core

Pattern: Controllers → Services → Data

Validation: DTO validation → Domain exceptions

Error Handling: Global Exception Middleware

Containerization: Docker & Docker Compose

API Documentation: Swagger / OpenAPI

Frontend

Framework: React (Vite)

Routing: React Router

State Management: Local component state + localStorage

UI: Component-based layout with basic styling

API Communication: Fetch-based REST integration

Routing Guards: Centralized at Router level

🧠 Error Handling & Validation (Backend)

The API uses a unified error-handling strategy based on domain exceptions
and a global exception middleware.

All errors are returned using the ProblemDetails format:

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

Request validation errors → 400 Bad Request

Business rule violations → 400 Bad Request

Missing resources → 404 Not Found

Database conflicts → 409 Conflict

Unhandled errors → 500 Internal Server Error

This ensures consistent, frontend-ready error responses.

🗂️ Project Structure
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
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
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

🐳 Running with Docker (Backend)
Prerequisites

Docker

Docker Compose

Environment Variables

Create a .env file (not committed):

MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=learning_platform
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini


An example is provided in .env.example.

Build & Run
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

Database connection adapts automatically per environment

🚀 Future Improvements

Full OpenAI GPT API integration

Authentication & authorization (JWT)

Pagination & filtering

Unit & integration tests

Frontend Dockerization

Improved UI/UX polish

👩‍💻 Author

Developed as part of an AI-Driven Learning Platform – Mini MVP programming task.

✅ Recommended Commits
🔹 Backend Core
git commit -m "feat: add user prompt history and unified error handling"

🔹 Frontend Completion
git commit -m "feat(frontend): complete React client with learning flow and basic UI"
