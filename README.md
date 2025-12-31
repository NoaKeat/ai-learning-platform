AI-Driven Learning Platform (Mini MVP)
📌 Overview

This repository contains a full-stack Mini MVP for an AI-driven learning platform.

The system allows users to choose what they want to learn (by category and sub-category), submit learning prompts, receive AI-generated lessons, and review their personal learning history.

The project was built to demonstrate software architecture skills, clean API design, frontend-backend integration, and delivery quality, with a strong emphasis on clarity, maintainability, and correctness.

🎯 Product Capabilities
User Flow

Register as a new user (Sign-Up)

Log in as an existing user (Log-In)

Select learning categories and sub-categories

Submit a learning prompt

Receive an AI-generated lesson

View personal learning history

Admin Flow

View all registered users

View prompt history per user (admin dashboard)

🧱 Architecture Overview

The system is built with clearly separated layers and follows production-grade design principles.

Backend

Framework: ASP.NET Core Web API

Database: MySQL

ORM: Entity Framework Core

Architecture: Controllers → Services → Data

Validation: DTO validation → domain exceptions

Error Handling: Global exception middleware

API Documentation: Swagger / OpenAPI

Containerization: Docker & Docker Compose

Frontend

Framework: React (Vite)

Routing: React Router

State Management: Local component state + localStorage

API Communication: Fetch-based REST abstraction

Route Protection: Guarded routes for authenticated users

UI: Simple, functional dashboard (focus on behavior, not styling)

🔧 Backend Features

User registration (Sign-Up)

User login (Log-In)

Category & sub-category retrieval (auto-seeded)

Prompt submission with stored AI responses

User-scoped learning history

Admin endpoints for user & prompt inspection

Strict DTO-based API (no entity exposure)

Unified error handling using ProblemDetails

Environment-based configuration (Local / Docker)

🎨 Frontend Features

Dedicated Sign-Up and Log-In pages

Automatic navigation based on backend responses

Protected learning dashboard

Category & sub-category selection flow

Prompt submission and AI response rendering

Learning history view per user

Admin dashboard for system-wide inspection

Clean component structure with controlled side-effects

Frontend Dockerization was intentionally deferred to keep the MVP focused.

🧠 Error Handling Strategy

The backend uses a single, unified error-handling mechanism based on domain exceptions and a global middleware.

All errors are returned in a frontend-friendly ProblemDetails format:

{
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/prompts",
  "extensions": {
    "code": "VALIDATION_ERROR",
    "traceId": "00-acde..."
  }
}

Error Mapping

Validation errors → 400 Bad Request

Business rule violations → 400 Bad Request

Resource not found → 404 Not Found

Data conflicts → 409 Conflict

Unhandled errors → 500 Internal Server Error

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
│       └── Dockerfile
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── SignUp.jsx
│       │   ├── Login.jsx
│       │   ├── Learn.jsx
│       │   └── Admin.jsx
│       ├── components/
│       ├── api/
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

Deployment to cloud environment

👩‍💻 Author

Developed as part of an AI-Driven Learning Platform – Mini MVP task
to demonstrate full-stack architecture, API design, and frontend integration skills.