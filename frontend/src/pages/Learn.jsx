import React, { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";

import UnexpectedErrorAlert from "@/components/common/UnexpectedErrorAlert";
import { isUnexpectedError } from "@/api/apiErrors";

import TopNav from "../components/learning/TopNav";
import CategorySelector from "../components/learning/CategorySelector";
import PromptForm from "../components/learning/PromptForm";
import ResponsePanel from "../components/learning/ResponsePanel";
import HistoryList from "../components/learning/HistoryList";
import HistoryDetailsModal from "../components/learning/HistoryDetailsModal";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Loader2 } from "lucide-react";

/* ================== Admin Lock Config ================== */
const MAX_ADMIN_ATTEMPTS = 3;
const ADMIN_LOCK_MINUTES = 5;
/* ======================================================= */

export default function Learn() {
  const userId = localStorage.getItem("userId");
  if (!userId) return <Navigate to="/login" replace />;

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* ---------- Errors ---------- */
  const [unexpectedError, setUnexpectedError] = useState(null);
  const [adminDeniedMessage, setAdminDeniedMessage] = useState("");

  /* ---------- Admin Auth ---------- */
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  const [adminAttempts, setAdminAttempts] = useState(
    Number(localStorage.getItem("adminAttempts") || 0)
  );

  const [adminLockedUntil, setAdminLockedUntil] = useState(
    Number(localStorage.getItem("adminLockedUntil") || 0)
  );

  const isAdminLocked = () =>
    adminLockedUntil && Date.now() < adminLockedUntil;

  /* auto hide admin alert */
  useEffect(() => {
    if (!adminDeniedMessage) return;
    const t = setTimeout(() => setAdminDeniedMessage(""), 5000);
    return () => clearTimeout(t);
  }, [adminDeniedMessage]);

  /* listen to TopNav admin click */
  useEffect(() => {
    const open = () => {
      setAdminKeyInput("");
      setAdminModalOpen(true);
    };
    window.addEventListener("open-admin-auth", open);
    return () => window.removeEventListener("open-admin-auth", open);
  }, []);

  /* ---------- Categories ---------- */
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      setUnexpectedError(null);
      try {
        const data = await api.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isUnexpectedError(err)) return setUnexpectedError(err);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  /* ---------- Learning Flow ---------- */
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastResponse, setLastResponse] = useState(null);

  const handlePromptSubmit = async (prompt) => {
    setSubmitError("");
    setUnexpectedError(null);
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
      if (isUnexpectedError(err)) return setUnexpectedError(err);
      setSubmitError("Failed to generate lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- History ---------- */
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const data = await api.getHistory(userId);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistoryError("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /* ---------- Admin Verify + Lock ---------- */
  const verifyAdminKey = async () => {
    if (isAdminLocked()) {
      setAdminDeniedMessage(
        "Too many failed attempts. Access is temporarily locked."
      );
      setAdminModalOpen(false);
      return;
    }

    setAdminAuthLoading(true);

    try {
      const key = adminKeyInput.trim();
      if (!key) throw new Error();

      const res = await fetch(
        `${API_BASE_URL}/api/admin/users?page=1&pageSize=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-ADMIN-KEY": key,
          },
        }
      );

      if (!res.ok) throw new Error();

      // success
      localStorage.removeItem("adminAttempts");
      localStorage.removeItem("adminLockedUntil");
      setAdminAttempts(0);
      setAdminLockedUntil(0);

      localStorage.setItem("adminKey", key);
      window.dispatchEvent(new Event("auth-changed"));
      setAdminModalOpen(false);
      navigate("/admin");

    } catch {
      const next = adminAttempts + 1;
      setAdminAttempts(next);
      localStorage.setItem("adminAttempts", next);

      if (next >= MAX_ADMIN_ATTEMPTS) {
        const lockUntil =
          Date.now() + ADMIN_LOCK_MINUTES * 60 * 1000;
        setAdminLockedUntil(lockUntil);
        localStorage.setItem("adminLockedUntil", lockUntil);
        setAdminDeniedMessage(
          "Too many failed attempts. Access is temporarily locked."
        );
      } else {
        setAdminDeniedMessage("Invalid admin password.");
      }
      setAdminModalOpen(false);
    } finally {
      setAdminAuthLoading(false);
    }
  };

  /* ================== RENDER ================== */
  return (
    <div className="min-h-screen">
      <TopNav />

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <UnexpectedErrorAlert error={unexpectedError} />

        {adminDeniedMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{adminDeniedMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          onCategoryChange={(id) => {
            setSelectedCategoryId(String(id || ""));
            setSelectedSubCategoryId("");
          }}
          onSubCategoryChange={(id) =>
            setSelectedSubCategoryId(String(id || ""))
          }
          isLoading={categoriesLoading}
          error={categoriesError}
        />

        <PromptForm
          onSubmit={handlePromptSubmit}
          isSubmitting={isSubmitting}
          isDisabled={!selectedCategoryId || !selectedSubCategoryId}
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
        onClose={() => setIsModalOpen(false)}
      />

      {/* Admin Modal */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Admin Access
            </DialogTitle>
          </DialogHeader>

          <Input
            type="password"
            placeholder="Enter admin password"
            value={adminKeyInput}
            onChange={(e) => setAdminKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verifyAdminKey()}
          />

          <Button
            onClick={verifyAdminKey}
            disabled={adminAuthLoading}
            className="w-full"
          >
            {adminAuthLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Enter"
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
