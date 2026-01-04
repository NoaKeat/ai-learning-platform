This document describes the platform's API methods, authentication rules, and request/response formats.
It helps reviewers understand how to use the system end-to-end.

---

## Base URLs
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger`
- Frontend (dev): `http://localhost:5173`

---

## Authentication

### JWT (User)
After register/login the client receives a JWT token.  
Protected endpoints require:

`Authorization: Bearer <JWT>`

JWT validation is enforced server-side (issuer, audience, signature, expiration).

### Admin Key (Admin endpoints)
Admin endpoints require:

`X-ADMIN-KEY: <ADMIN_KEY>`

If missing/invalid → request is rejected before controller execution.

---

## High-Level Data Model
- `users`: id, name, phone, password_hash, role
- `categories`: id, name
- `sub_categories`: id, name, category_id
- `prompts`: id, user_id, category_id, sub_category_id, prompt, response, created_at

Relationships:
- User 1 → many Prompts
- Category 1 → many SubCategories
- Prompt references User + Category + SubCategory

---

## API Methods

## 1) Register
**POST** `/api/users/register`

**Request**
```json
{
  "name": "Israel",
  "phone": "0501234567",
  "password": "StrongPassword123"
}
Response

json
Copy code
{
  "userId": 1,
  "token": "..."
}
2) Login
POST /api/users/login

Request

json
Copy code
{
  "phone": "0501234567",
  "password": "StrongPassword123"
}
Response

json
Copy code
{
  "userId": 1,
  "token": "..."
}
3) Current User
GET /api/users/me

Headers

Authorization: Bearer <JWT>

4) Generate Lesson (Create Prompt)
POST /api/prompts

Stores the prompt and returns an AI-generated lesson-like response.

Headers

Authorization: Bearer <JWT>

Request

json
Copy code
{
  "categoryId": 1,
  "subCategoryId": 3,
  "prompt": "Teach me about black holes."
}
Response

json
Copy code
{
  "promptId": 10,
  "response": "..."
}
AI Behavior
Live AI mode: uses OpenAI if configured

Automatic mock fallback: if API key missing / provider fails → returns deterministic mock response

5) User Learning History
GET /api/prompts/history

Returns the authenticated user's prompt history.

Headers

Authorization: Bearer <JWT>

Admin Methods
6) List Users (Paginated + Search)
GET /api/admin/users?page=1&pageSize=10&search=...

Headers

X-ADMIN-KEY: <ADMIN_KEY>

Notes:

Server-side pagination

Filtering via search (name/phone/id, depending on implementation)

7) User Prompt History (Paginated + Search)
GET /api/admin/users/{userId}/prompts?page=1&pageSize=10&search=...

Headers

X-ADMIN-KEY: <ADMIN_KEY>

Error Handling
All errors return consistent ProblemDetails.

Common statuses:

400 Validation errors

401 Unauthorized (missing/invalid JWT)

403 Forbidden (admin key invalid)

404 Not Found

409 Conflict

500 Unhandled server errors

Frontend behavior:

4xx → inline user-friendly message

5xx/network → UnexpectedError UI + traceId (when available)

End-to-End Example Flow
Register/Login → receive JWT

Submit prompt → receive lesson + stored in DB

View history (user)

Admin: list users → open user → view user prompt history


