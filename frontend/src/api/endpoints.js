export const endpoints = {
  register: "/api/users/register",
  categories: "/api/categories",
  createPrompt: "/api/Prompts", // ⚠️ Capital P כמו ב-Swagger שלך
  login: "/api/users/login",
  history: (userId) => `/api/Prompts/history?userId=${encodeURIComponent(userId)}`,
};
