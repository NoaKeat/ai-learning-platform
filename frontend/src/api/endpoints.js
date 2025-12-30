export const endpoints = {
  register: "/api/users/register",
  categories: "/api/categories",
  createPrompt: "/api/Prompts", // ⚠️ Capital P כמו ב-Swagger שלך
  history: (userId) => `/api/Prompts/history?userId=${userId}`, // ⚠️ Capital P
};
