# AI-Driven Learning Platform (Mini MVP)

## 📌 Overview
This project is a **mini AI-driven learning platform** that allows users to:
- Register to the system
- Choose a learning category and sub-category
- Submit a learning prompt
- Receive an AI-generated response (currently mocked)
- View their learning history

The system is built as a **production-grade backend MVP**, focusing on:
clean architecture, layered design, database modeling, and API clarity.

---

## 🎯 Implemented Features
- ✅ User registration with validation
- ✅ Categories & sub-categories (seeded automatically)
- ✅ Prompt submission with stored responses (mock AI)
- ✅ User learning history
- ✅ DTO-based API (no direct model exposure)
- ✅ Service layer (business logic separation)
- ✅ REST API with Swagger documentation
- ✅ Dockerized MySQL database

---

## 🏗️ Architecture
- **Backend:** ASP.NET Core Web API
- **Database:** MySQL
- **ORM:** Entity Framework Core
- **Architecture Pattern:** Controllers → Services → Data
- **Containerization:** Docker & Docker Compose
- **API Documentation:** Swagger / OpenAPI

---

## 🗂️ Project Structure
ai-learning-platform/
├── backend/
│ └── LearningPlatform.Api/
│ ├── Controllers/
│ │ ├── UsersController.cs
│ │ ├── CategoriesController.cs
│ │ └── PromptsController.cs
│ ├── Services/
│ │ ├── IUserService.cs
│ │ ├── UserService.cs
│ │ ├── ICategoryService.cs
│ │ ├── CategoryService.cs
│ │ ├── IPromptService.cs
│ │ └── PromptService.cs
│ ├── DTOs/
│ ├── Models/
│ ├── Data/
│ │ └── DbInitializer.cs
│ ├── Migrations/
│ ├── Program.cs
│ ├── Dockerfile
│ └── LearningPlatform.Api.csproj
├── docker-compose.yml
├── .env.example
└── README.md

yaml
Copy code

---

## 🧱 Database Schema
The system uses a relational database with proper constraints:

### Tables
- **Users**  
  `id, name, phone`

- **Categories**  
  `id, name`

- **SubCategories**  
  `id, name, category_id`

- **Prompts**  
  `id, user_id, category_id, sub_category_id, prompt, response, created_at`

### Relationships
- Category → many SubCategories  
- User → many Prompts  
- Prompt → Category & SubCategory  

---

## 🧪 Seed Data
On first startup, the database is automatically seeded with:

- **Science** → Space, Biology  
- **Tech** → AI, Web Dev  
- **Math** → Algebra, Calculus  
- **History** → Ancient, Modern  

Seeding runs only once and is skipped if data already exists.

---

## 🐳 Running the Project with Docker

### 1️⃣ Prerequisites
- Docker
- Docker Compose

---

### 2️⃣ Environment Variables
Create a `.env` file (do **not** commit it):

```env
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=learning_platform
An example file is provided:

Copy code
.env.example
3️⃣ Build & Run
From the project root:

bash
Copy code
docker compose up --build
4️⃣ Verify
Swagger UI:

bash
Copy code
http://localhost:8080/swagger
MySQL:

Runs on port 3306

Uses a persistent Docker volume

🧪 API Endpoints (Summary)
Users
POST /api/users/register

GET /api/users/{id}

Categories
GET /api/categories

GET /api/categories/by-name/{name}

Prompts
POST /api/prompts

GET /api/prompts/history/{userId}

⚙️ Configuration Strategy
Local development uses appsettings.Development.json

Docker environment uses environment variables

Database connection adapts automatically based on environment

🚀 Future Improvements
OpenAI GPT API integration

Authentication (JWT)

Pagination & filtering

Admin dashboard

Unit & integration tests

Frontend dashboard (React / Vue)

📝 Notes
This project focuses on clarity, modularity, and maintainability
rather than full feature completion.
It serves as a strong backend foundation for further expansion.

👩‍💻 Author
Developed as part of an AI-Driven Learning Platform programming task.

yaml
Copy code

---

## ✅ עכשיו בפועל
```bash
git add README.md
git commit -m "Update README with architecture and API documentation"
git push