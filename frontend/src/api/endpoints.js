export const endpoints = {
  register: "/api/users/register",
  login: "/api/users/login",

  categories: "/api/categories",

  // ✅ חשוב: אותיות קטנות - תואם לנתיב בפועל
  createPrompt: "/api/prompts",

  // ✅ history יושב תחת prompts
  history: (userId) =>
    `/api/prompts/history?userId=${encodeURIComponent(userId)}`,

  // אופציונלי אם את משתמשת בזה
  me: "/api/users/me",
};


