AI-Driven Learning Platform (Mini MVP)
📌 Overview

This repository contains a full-stack Mini MVP for an AI-driven learning platform.

Users can choose what they want to learn (by category & sub-category), submit prompts, receive AI-generated lessons, and review their personal learning history.

The project demonstrates clean architecture, production-grade API design, frontend-backend integration, and maintainable error handling with a consistent client experience.

🎯 Product Capabilities
User Flow

Sign up (register)

Log in

Select category & sub-category

Submit a learning prompt

Receive an AI-generated lesson

View personal learning history

Admin Flow

View all registered users

View prompt history per user (admin dashboard)

🧱 Architecture Overview
Backend

Framework: ASP.NET Core Web API

Database: MySQL

ORM: Entity Framework Core

Architecture: Controllers → Services → Data

Validation: DTO validation → domain exceptions

Error Handling: Global exception middleware (ProblemDetails)

API Docs: Swagger / OpenAPI

Containerization: Docker & Docker Compose

Frontend

Framework: React (Vite)

Routing: React Router

State: Local component state + localStorage

API Communication: Centralized fetch wrapper (apiClient)

Route Protection: Guarded routes for authenticated users

Error UX: Consistent “expected vs unexpected” strategy

UI: Functional dashboard with clean component structure

🔧 Backend Features

User registration + login

Category & sub-category retrieval (auto-seeded)

Prompt submission with stored AI responses

User-scoped learning history

Admin endpoints for system inspection

Strict DTO-based API (no entity exposure)

Unified error handling using ProblemDetails

Environment-based configuration (Local / Docker)

🎨 Frontend Features

Dedicated Sign-Up and Log-In pages

Automatic navigation based on backend responses (expected flows)

Protected learning dashboard

Category/sub-category selection

Prompt submission and AI response rendering

Learning history view per user

Centralized API client for consistent responses/errors

Consistent error UX:

expected errors handled per screen

unexpected errors shown via one shared component

🧠 Error Handling Strategy (Updated)
Backend: Unified ProblemDetails

All backend errors are returned in a frontend-friendly ProblemDetails shape:

{
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/Prompts",
  "extensions": {
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": {
        "phone": ["Phone must be a valid Israeli number (05XXXXXXXX)"]
      }
    },
    "traceId": "00-acde..."
  }
}

Error Mapping

Validation errors → 400 Bad Request

Business rule violations → 400 Bad Request

Resource not found → 404 Not Found

Data conflicts → 409 Conflict

Unhandled errors → 500 Internal Server Error

Frontend: Expected vs Unexpected (Production-grade UX)

The frontend distinguishes between:

✅ Expected errors (handled explicitly per flow)

409 PHONE_ALREADY_EXISTS → redirect to Log-In with friendly message

404 USER_NOT_FOUND → redirect to Sign-Up with friendly message

400 VALIDATION_ERROR → show field-level errors / input messages

❌ Unexpected errors (generic UI, consistent everywhere)

Network errors (fetch failure) → status = 0

Server errors (5xx) → status >= 500

Unexpected errors are displayed via a single shared component:

UnexpectedErrorAlert.jsx

includes a generic message (“Please try again later”) + optional traceId

🗂️ Project Structure (Updated)
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
│       └── Dockerfile
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Register.jsx
│       │   ├── Login.jsx
│       │   ├── Learn.jsx
│       │   └── Admin.jsx
│       ├── components/
│       │   └── common/
│       │       └── UnexpectedErrorAlert.jsx
│       ├── api/
│       │   ├── apiClient.js
│       │   ├── endpoints.js
│       │   └── apiErrors.js
│       ├── utils/
│       └── App.jsx
├── docker-compose.yml
├── .env.example
└── README.md

🧱 Database Schema
Tables

users: id, name, phone

categories: id, name

sub_categories: id, name, category_id

prompts: id, user_id, category_id, sub_category_id, prompt, response, created_at

Relationships

User → many Prompts

Category → many SubCategories

Prompt → Category & SubCategory

🌱 Seed Data

On first startup, the database is automatically seeded with sample data:

Science → Space, Biology

Tech → AI, Web Development

Math → Algebra, Calculus

History → Ancient, Modern

Seeding runs once and is skipped if data already exists.

🐳 Running the Project Locally
Prerequisites

Docker

Docker Compose

Node.js (for frontend)

Environment Variables

Create a .env file (example provided in .env.example):

MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=learning_platform
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini

Backend
docker compose up --build


Swagger UI: http://localhost:8080/swagger

MySQL: port 3306

Frontend
cd frontend
npm install
npm run dev


Frontend: http://localhost:5173

🚀 Future Improvements

JWT-based authentication & authorization

Pagination and filtering in admin dashboard

Automated unit & integration tests

Frontend Dockerization

UI/UX refinement

Cloud deployment

👩‍💻 Author

Developed as part of an AI-Driven Learning Platform – Mini MVP task
to demonstrate full-stack architecture, API design, and frontend integration skills.