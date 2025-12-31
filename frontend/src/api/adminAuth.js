const KEY = "adminKey";

export const getAdminKey = () => localStorage.getItem(KEY);
export const setAdminKey = (v) => localStorage.setItem(KEY, v);
export const clearAdminKey = () => localStorage.removeItem(KEY);
export const isAdminAuthed = () => Boolean(getAdminKey());
