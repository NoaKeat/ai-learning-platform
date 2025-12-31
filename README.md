# AI-Driven Learning Platform (Mini MVP)

## 📌 Overview
This repository contains a full-stack **Mini MVP** for an AI-driven learning platform.

The platform allows users to select what they want to learn (by category and sub-category),
submit learning prompts, receive AI-generated lessons, and review their personal learning history.

The project focuses on **clean architecture**, **production-grade API design**,
clear frontend-backend separation, and **maintainable error handling** with a consistent user experience.

---

## 🎯 Product Capabilities

### User Flow
- Sign up (register)
- Log in
- Select category & sub-category
- Submit a learning prompt
- Receive an AI-generated lesson
- View personal learning history

### Admin Flow
- Secure access to admin dashboard
- View all registered users
- View prompt history per user
- Server-side paginated user listing

---

## 🧱 Architecture Overview

### Backend
- **Framework:** ASP.NET Core Web API
- **Database:** MySQL
- **ORM:** Entity Framework Core
- **Architecture:** Controllers → Services → Data
- **Validation:** DTO validation → domain exceptions
- **Error Handling:** Global exception middleware using ProblemDetails
- **API Docs:** Swagger / OpenAPI
- **Containerization:** Docker & Docker Compose

### Frontend
- **Framework:** React (Vite)
- **Routing:** React Router
- **State Management:** Local component state + localStorage
- **API Communication:** Centralized API client
- **Route Protection:** Guarded routes for authenticated users
- **UI:** Clean, functional learning and admin dashboards

---

## 🔧 Backend Features
- User registration and login
- Category & sub-category retrieval (auto-seeded)
- Prompt submission with stored AI responses
- User-scoped learning history
- Admin endpoints with server-side pagination
- Strict DTO-based API (no entity exposure)
- Unified error handling using ProblemDetails

---

## 🎨 Frontend Features
- Dedicated Sign-Up and Log-In pages
- Protected learning dashboard
- Category & sub-category selection
- Prompt submission and AI response rendering
- Learning history per user
- Admin dashboard with classic pagination
- Centralized error handling strategy

---

## 📄 Admin Pagination Strategy
The admin dashboard uses **server-side pagination** with a fixed page size.

- Each page displays **10 users**
- Navigation uses **classic page controls (Previous / Next)**
- Backend endpoints support `page` and `pageSize`
- This approach ensures predictable tables and production-grade admin workflows

---

## 🧠 Error Handling Strategy

### Backend (ProblemDetails)
All backend errors are returned in a consistent ProblemDetails format.

- Validation errors → 400
- Business rule violations → 400
- Resource not found → 404
- Data conflicts → 409
- Unhandled errors → 500

---

## 🗂️ Project Structure
ai-learning-platform/
├── backend/
│ └── LearningPlatform.Api/
├── frontend/
│ └── src/
│ ├── pages/
│ ├── components/
│ ├── api/
│ ├── utils/
│ └── App.jsx
├── docker-compose.yml
├── .env.example
└── README.md

yaml
Copy code

---

## 🐳 Running the Project Locally

### Prerequisites
- Docker
- Docker Compose
- Node.js

### Backend
```bash
docker compose up --build
Swagger UI: http://localhost:8080/swagger

Frontend
bash
Copy code
cd frontend
npm install
npm run dev
Frontend: http://localhost:5173

🚀 Future Improvements
JWT-based authentication & authorization

Advanced admin filtering

Automated unit & integration tests

Frontend Dockerization

UI/UX refinement

Cloud deployment

👩‍💻 Author
Developed as part of an AI-Driven Learning Platform – Mini MVP task
to demonstrate full-stack architecture, API design, and frontend-backend integration skills.

yaml
Copy code
