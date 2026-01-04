export const endpoints = {
  register: "/api/users/register",
  login: "/api/users/login",

  categories: "/api/categories",

  createPrompt: "/api/prompts",

  history: (userId) =>
    `/api/prompts/history?userId=${encodeURIComponent(userId)}`,

  me: "/api/users/me",
};


