import React, { useState, useEffect, useCallback } from "react";

import TopNav from "../components/learning/TopNav";
import CategorySelector from "../components/learning/CategorySelector";
import PromptForm from "../components/learning/PromptForm";
import ResponsePanel from "../components/learning/ResponsePanel";
import HistoryList from "../components/learning/HistoryList";
import HistoryDetailsModal from "../components/learning/HistoryDetailsModal";
import { Navigate } from "react-router-dom";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Learn() {
  
  const userId = localStorage.getItem("userId");
  if (!userId) return <Navigate to="/login" replace />;

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // ✅ Controlled select values from first render (no uncontrolled->controlled)
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  // Prompt/response
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastResponse, setLastResponse] = useState(null);

  // History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  // Modal
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");

      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        setCategoriesError(e?.message || "Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/Prompts/history?userId=${encodeURIComponent(userId)}`
      );
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      setHistoryError(e?.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ✅ Wrap setters so values stay strings and subcategory resets on category change
  const handleCategoryChange = (categoryId) => {
    const next = categoryId ? String(categoryId) : "";
    setSelectedCategoryId(next);
    setSelectedSubCategoryId(""); // reset when category changes
    setSubmitError("");
  };

  const handleSubCategoryChange = (subCategoryId) => {
    const next = subCategoryId ? String(subCategoryId) : "";
    setSelectedSubCategoryId(next);
    setSubmitError("");
  };

  // Submit prompt
  const handlePromptSubmit = async (prompt) => {
    setSubmitError("");

    if (!selectedCategoryId || !selectedSubCategoryId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/Prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          categoryId: Number(selectedCategoryId),
          subCategoryId: Number(selectedSubCategoryId),
          prompt,
        }),
      });

      // ✅ Better error visibility (500s often aren't JSON)
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server error (${res.status})`);
      }

      const data = await res.json();
      setLastResponse(data);

      // refresh history after success
      await fetchHistory();
    } catch (e) {
      setSubmitError(e?.message || "Failed to generate lesson");
      console.error("POST /api/Prompts failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          onCategoryChange={handleCategoryChange}
          onSubCategoryChange={handleSubCategoryChange}
          isLoading={categoriesLoading}
          error={categoriesError}
        />

        <PromptForm
          onSubmit={handlePromptSubmit}
          isSubmitting={isSubmitting}
          isDisabled={!selectedCategoryId || !selectedSubCategoryId || isSubmitting}
          disabledReason={
            !selectedCategoryId
              ? "Please select a category"
              : !selectedSubCategoryId
              ? "Please select a sub-category"
              : ""
          }
          error={submitError}
        />

        <ResponsePanel response={lastResponse} />

        <HistoryList
          history={history}
          isLoading={historyLoading}
          error={historyError}
          onRefresh={fetchHistory}
          onViewItem={(item) => {
            setSelectedHistoryItem(item);
            setIsModalOpen(true);
          }}
        />
      </main>

      <HistoryDetailsModal
        item={selectedHistoryItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHistoryItem(null);
        }}
      />
    </div>
  );
}
