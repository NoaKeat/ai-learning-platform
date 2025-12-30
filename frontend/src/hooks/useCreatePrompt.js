import { useState } from "react";
import { api } from "../api/apiClient";

export function useCreatePrompt() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createPrompt = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      const data = await api.createPrompt(payload);
      return data;
    } catch (e) {
      setError(e.message || "Failed to generate lesson");
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  return { createPrompt, submitting, error };
}
