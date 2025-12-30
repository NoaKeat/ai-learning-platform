import { useEffect, useState } from "react";
import { api } from "../api/apiClient";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.getCategories();
        if (alive) setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setError(e.message || "Failed to load categories");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { categories, loading, error };
}
