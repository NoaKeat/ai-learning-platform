import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/apiClient";

import UnexpectedErrorAlert from "@/components/common/UnexpectedErrorAlert";
import { isUnexpectedError } from "@/api/apiErrors";

import TopNav from "../components/learning/TopNav";
import CategorySelector from "../components/learning/CategorySelector";
import PromptForm from "../components/learning/PromptForm";
import ResponsePanel from "../components/learning/ResponsePanel";
import HistoryList from "../components/learning/HistoryList";
import HistoryDetailsModal from "../components/learning/HistoryDetailsModal";

export default function Learn() {
  const userId = localStorage.getItem("userId");
  if (!userId) return <Navigate to="/login" replace />;

  // ❌ only for unexpected
  const [unexpectedError, setUnexpectedError] = useState(null);

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(""); // expected only

  // Controlled select values
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  // Prompt/response
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(""); // expected only
  const [lastResponse, setLastResponse] = useState(null);

  // History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(""); // expected only

  // Modal
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch categories (via apiClient for consistent errors)
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      setUnexpectedError(null);

      try {
        const data = await api.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isUnexpectedError(err)) {
          setUnexpectedError(err);
          return;
        }
        setCategoriesError(err?.message || "Failed to load categories");
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
    setUnexpectedError(null);

    try {
      const data = await api.getHistory(userId);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isUnexpectedError(err)) {
        setUnexpectedError(err);
        return;
      }
      setHistoryError(err?.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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

  const handlePromptSubmit = async (prompt) => {
    setSubmitError("");
    setUnexpectedError(null);

    if (!selectedCategoryId || !selectedSubCategoryId) return;

    setIsSubmitting(true);
    try {
      const data = await api.createPrompt({
        userId: Number(userId),
        categoryId: Number(selectedCategoryId),
        subCategoryId: Number(selectedSubCategoryId),
        prompt,
      });

      setLastResponse(data);
      await fetchHistory();
    } catch (err) {
      if (isUnexpectedError(err)) {
        setUnexpectedError(err);
        return;
      }
      setSubmitError(err?.message || "Failed to generate lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopNav />

      {/* ❌ only unexpected errors */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <UnexpectedErrorAlert error={unexpectedError} />
      </div>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          onCategoryChange={handleCategoryChange}
          onSubCategoryChange={handleSubCategoryChange}
          isLoading={categoriesLoading}
          error={categoriesError} // expected only
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
          error={submitError} // expected only
        />

        <ResponsePanel response={lastResponse} />

        <HistoryList
          history={history}
          isLoading={historyLoading}
          error={historyError} // expected only
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


