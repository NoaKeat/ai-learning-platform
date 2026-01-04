// Learn.jsx (מתוקן) — להדבקה מלאה
import React, { useState, useEffect, useCallback, useMemo } from "react";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Loader2 } from "lucide-react";

const MAX_ADMIN_ATTEMPTS = 3;
const ADMIN_LOCK_MINUTES = 5;

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

  const isAdminLocked = () => adminLockedUntil && Date.now() < adminLockedUntil;

  useEffect(() => {
    if (!adminDeniedMessage) return;
    const t = setTimeout(() => setAdminDeniedMessage(""), 5000);
    return () => clearTimeout(t);
  }, [adminDeniedMessage]);

  useEffect(() => {
    const open = () => {
      setAdminKeyInput("");
      setAdminModalOpen(true);
    };
    window.addEventListener("open-admin-auth", open);
    return () => window.removeEventListener("open-admin-auth", open);
  }, []);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const data = await api.getCategories();

        setCategories(Array.isArray(data) ? data : []);
        setCategoriesError("");

        setUnexpectedError(null);
      } catch (err) {
        if (isUnexpectedError(err)) return setUnexpectedError(err);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastResponse, setLastResponse] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const data = await api.myHistory(Number(userId)); 
      setHistory(Array.isArray(data) ? data : []);
      setUnexpectedError(null);
    } catch (err) {
      if (isUnexpectedError(err)) return setUnexpectedError(err);
      setHistoryError(err?.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);



  const handlePromptSubmit = async (prompt) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const data = await api.createPrompt({
        userId: Number(userId),
        categoryId: Number(selectedCategoryId),
        subCategoryId: Number(selectedSubCategoryId),
        prompt,
      });

      setLastResponse(data);

      setHistory((prev) => [
        {
          id: data.id ?? crypto.randomUUID(),
          prompt: data.prompt ?? prompt,
          response: data.response ?? data.aiResponse ?? "",
          createdAt: new Date().toISOString(),
          categoryName: data.categoryName ?? "",
          subCategoryName: data.subCategoryName ?? "",
        },
        ...prev,
      ]);

      fetchHistory();
    } catch (err) {
      if (isUnexpectedError(err)) setUnexpectedError(err);
      else setSubmitError("Failed to generate lesson");
    } finally {
      setIsSubmitting(false);
    }
  };


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
      if (!key) {
        setAdminDeniedMessage("Please enter admin password.");
        return;
      }

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

      if (!res.ok) {
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          const next = adminAttempts + 1;
          setAdminAttempts(next);
          localStorage.setItem("adminAttempts", String(next));

          if (next >= MAX_ADMIN_ATTEMPTS) {
            const lockUntil = Date.now() + ADMIN_LOCK_MINUTES * 60 * 1000;
            setAdminLockedUntil(lockUntil);
            localStorage.setItem("adminLockedUntil", String(lockUntil));
            setAdminDeniedMessage(
              "Too many failed attempts. Access is temporarily locked."
            );
          } else {
            setAdminDeniedMessage("Invalid admin password.");
          }

          setAdminModalOpen(false);
          return;
        }

        if (res.status === 409) {
          setAdminDeniedMessage(
            "Server configuration error (admin key is not configured)."
          );
          setAdminModalOpen(false);
          return;
        }

        const err = new Error(`Admin verification failed (HTTP ${res.status})`);
        err.status = res.status;
        setUnexpectedError(err);
        setAdminDeniedMessage("Something went wrong. Please try again.");
        setAdminModalOpen(false);
        return;
      }

      localStorage.removeItem("adminAttempts");
      localStorage.removeItem("adminLockedUntil");
      setAdminAttempts(0);
      setAdminLockedUntil(0);

      localStorage.setItem("adminKey", key);
      window.dispatchEvent(new Event("auth-changed"));
      setAdminModalOpen(false);

      setUnexpectedError(null);
      setAdminDeniedMessage("");

      navigate("/admin");
    } catch (err) {
      setUnexpectedError(err instanceof Error ? err : new Error("Unknown error"));
      setAdminDeniedMessage("Network/server error. Please try again.");
      setAdminModalOpen(false);
    } finally {
      setAdminAuthLoading(false);
    }
  };

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
          disabledReason={
            !selectedCategoryId
              ? "Select a category first"
              : !selectedSubCategoryId
                ? "Select a sub-category first"
                : ""
          }
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

          <Button onClick={verifyAdminKey} disabled={adminAuthLoading} className="w-full">
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
