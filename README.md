AI-Driven Learning Platform (Mini MVP)
📌 Overview

This repository contains a production-grade Mini MVP for an AI-driven learning platform.

Users choose a learning topic (category + sub-category), submit a prompt, receive an AI-generated lesson, and review their personal learning history.
An Admin panel enables secure inspection of registered users and their learning activity.

The focus is clean architecture, explicit boundaries, defensive backend design, and real-world auth patterns.

✅ Functional Scope
User Capabilities

Register and log in

Receive a signed JWT on authentication

Select category and sub-category

Submit a learning prompt

Receive an AI-generated lesson

View personal learning history

Admin Capabilities

Secure access to admin endpoints (server-side enforced)

View all registered users (server-side pagination)

View learning history per user

🧱 System Architecture
Backend

Framework: ASP.NET Core Web API

Database: MySQL

ORM: Entity Framework Core

Architecture: Controllers → Services → Data

Validation: DTO validation mapped to domain exceptions

Error Handling: Global exception middleware returning consistent ProblemDetails

Authentication: JWT Bearer

Admin Protection: Server-side Admin key filter (X-ADMIN-KEY)

API Docs: Swagger / OpenAPI

Containerization: Docker + Docker Compose

Frontend

Framework: React (Vite)

Routing: React Router

State: Local component state + localStorage

API: Centralized API client with unified error handling

UI: Learning dashboard + Admin panel

🔐 Security Design
JWT Authentication (Implemented)

Users receive a signed JWT on register / login. Token includes:

sub (user id)

name

role

iss, aud, exp

JWT validation is enforced server-side:

Issuer

Audience

Signature

Expiration

Protected endpoints require:

Authorization: Bearer <JWT>

Admin Protection (Key-Based)

Admin endpoints are protected via a server-side filter. Requests must include:

X-ADMIN-KEY: <configured_admin_key>


Loaded from environment/config

Invalid or missing key is rejected before controller execution

Admin security is independent of frontend logic

🧠 AI Integration (Live + Automatic Mock Fallback)

The backend integrates with a real AI provider (OpenAI) to generate lesson content.

To keep local usage robust:

Live AI mode (default): uses OpenAI for real responses

Mock fallback: if API key is missing, network fails, or provider errors occur — the backend returns a deterministic mock lesson

This ensures the application remains functional even when external AI services are unavailable.

🧠 Error Handling Strategy

All backend errors return a consistent ProblemDetails format.

Error Type	HTTP Status
Validation errors	400
Business rule violations	400
Unauthorized	401
Not Found	404
Data conflicts	409
Unhandled server errors	500

Frontend distinguishes between:

Expected errors (4xx) – displayed inline

Unexpected errors (network / 5xx) – displayed with traceId when available

🔗 Key API Endpoints (High Level)
User

POST /api/users/register

POST /api/users/login

GET /api/users/me (JWT required)

Prompts + History

POST /api/prompts

GET /api/prompts/history?userId={id}

Admin

GET /api/admin/users?page=1&pageSize=10&search=...

GET /api/admin/users/{userId}/prompts?page=1&pageSize=10&search=...

🗂️ Project Structure
ai-learning-platform/
├── backend/
│   └── LearningPlatform.Api/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── api/
│       ├── utils/
│       └── App.jsx
├── docker-compose.yml
├── .env.example
└── README.md

🐳 Running the Project Locally
Prerequisites

Docker

Docker Compose

Node.js (v18+)

Backend (Docker)
docker compose up --build


API: http://localhost:8080

Swagger: http://localhost:8080/swagger

Frontend (Local Dev)
cd frontend
npm install
npm run dev


Frontend: http://localhost:5173

⚙️ Environment Configuration

Example .env:

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=learning_platform
DB_USER=root
DB_PASSWORD=example

# Admin
ADMIN_KEY=super-secret-admin-key

# AI
OPENAI_API_KEY=optional

# Frontend
VITE_API_BASE_URL=http://localhost:8080


⚠️ Do not commit real environment files.

📌 Assumptions & Limitations

JWT authentication is fully implemented for user access

Admin auth is key-based (role-based admin via JWT claims can be added later)

Categories are seeded programmatically

Automated tests are planned but not included in this MVP

🚀 Future Improvements

Role-based admin permissions via JWT claims

Advanced admin filtering + sorting

Unit + integration tests

Full frontend Dockerization

CI/CD + cloud deployment

👩‍💻 Author

Developed as part of an AI-Driven Learning Platform – Mini MVP
to demonstrate architectural thinking, backend robustness, and full-stack integration.