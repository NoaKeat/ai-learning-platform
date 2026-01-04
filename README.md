# AI-Driven Learning Platform (Mini MVP)

## 📌 Overview
A production-grade **Mini MVP** for an AI-driven learning platform.

Users select a learning topic (**category + sub-category**), submit a prompt, receive an AI-generated lesson,
and review their personal learning history.  
An **Admin panel** enables secure inspection of registered users and their learning activity.

This project emphasizes **clean architecture**, clear boundaries, defensive backend design, and real-world auth patterns.

---

## ✅ Functional Scope

### User
- Register and log in
- Receive a signed **JWT** on authentication
- Select category and sub-category
- Submit a learning prompt
- Receive an AI-generated lesson
- View personal learning history

### Admin
- Secure access to admin endpoints (**server-side enforced**)
- View all registered users (**server-side pagination + search**)
- View learning history per user (**server-side pagination + search**)

---

## 🧭 Approach
This Mini MVP was designed as a small but production-oriented system, emphasizing clean architecture, separation of concerns,
and real-world backend practices.

**ASP.NET Core Web API** was selected for strong typing, built-in dependency injection, a robust middleware pipeline,
and first-class support for authentication and API design.

Authentication uses **JWT Bearer tokens** with server-side validation (issuer, audience, signature, expiration).
Admin routes are protected via a **server-side Admin Key filter** (`X-ADMIN-KEY`) to keep admin access independent from frontend logic.

AI integration is encapsulated behind a dedicated service layer with an **automatic deterministic mock fallback**
when external AI services are unavailable (missing API key, network/provider errors).

---

## 🧱 System Architecture

### Backend
- Framework: **ASP.NET Core Web API**
- Database: **MySQL**
- ORM: **Entity Framework Core**
- Architecture: Controllers → Services → Data
- Validation: DTO validation mapped to domain exceptions
- Error Handling: Global exception middleware returning consistent **ProblemDetails**
- Authentication: JWT Bearer
- Admin Protection: Server-side Admin key filter (`X-ADMIN-KEY`)
- API Docs: Swagger / OpenAPI
- Containerization: Docker + Docker Compose

### Frontend
- Framework: **React (Vite)**
- Routing: React Router
- State: Local component state + localStorage
- API: Centralized API client with unified error handling
- UI: Learning dashboard + Admin panel

---

## 🔗 Key API Endpoints (High Level)

### User
- POST `/api/users/register`
- POST `/api/users/login`
- GET  `/api/users/me` (JWT required)

### Prompts + History
- POST `/api/prompts` (JWT required)
- GET  `/api/prompts/history` (JWT required)

### Admin
- GET `/api/admin/users?page=1&pageSize=10&search=...` (X-ADMIN-KEY required)
- GET `/api/admin/users/{userId}/prompts?page=1&pageSize=10&search=...` (X-ADMIN-KEY required)

➡️ For full request/response examples, see **METHODS.md**.

---

## 🗂️ Project Structure
```text
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
├── METHODS.md
└── README.md
🐳 Running the Project Locally
Prerequisites
Docker + Docker Compose

Node.js (v18+)

Backend (Docker)
bash
Copy code
docker compose up --build
API: http://localhost:8080

Swagger: http://localhost:8080/swagger

Frontend (Local Dev)
bash
Copy code
cd frontend
npm install
npm run dev
Frontend: http://localhost:5173

⚙️ Environment Configuration
Example .env (see .env.example):

env
Copy code
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
This is a Mini MVP focused on architecture, correctness, and end-to-end behavior.

Automated tests and CI/CD are intentionally not included in the current scope (timeframe-focused),
but can be added easily due to the chosen structure and service boundaries.

🚀 Future Improvements
Role-based admin permissions via JWT claims

Advanced admin filtering + sorting

Unit + integration tests

Full frontend Dockerization

CI/CD + cloud deployment

👩‍💻 Author
Developed as part of an AI-Driven Learning Platform – Mini MVP
to demonstrate architectural thinking, backend robustness, and full-stack integration.


