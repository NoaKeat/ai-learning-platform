import { useCallback, useEffect, useState } from "react";
import { api } from "../api/apiClient";

export function useHistory(userId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(
    async (isRefresh = false) => {
      if (!userId) return;

      setError("");
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await api.getHistory(userId);
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHistory(arr);
      } catch (e) {
        setError(e.message || "Failed to load history");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchHistory(false);
  }, [fetchHistory]);

  return { history, loading, refreshing, error, fetchHistory };
}
