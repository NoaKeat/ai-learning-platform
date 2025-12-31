import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  FolderTree,
  Layers,
  MessageSquare,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Hash,
  FileText,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import UnexpectedErrorAlert from "@/components/common/UnexpectedErrorAlert";
import { isUnexpectedError } from "@/api/apiErrors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function UserHistoryModal({ user, isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // error object (not string) so we can show TraceId when exists
  const [error, setError] = useState(null);

  // server-side pagination & search
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canLoadMore = page < totalPages;

  const adminKey = useMemo(() => {
    return import.meta.env.VITE_ADMIN_KEY || localStorage.getItem("adminKey") || "";
  }, []);

  // ✅ accept both {userId} and {id}
  const userId = useMemo(() => {
    const raw = user?.userId ?? user?.id;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [user]);

  useEffect(() => {
    if (!isOpen || !user) return;

    // reset modal state each time it opens for a user
    setHistory([]);
    setExpandedItems({});
    setError(null);
    setSearch("");
    setPage(1);
    setTotal(0);
    setIsLoading(true);
    setIsLoadingMore(false);
  }, [isOpen, userId, user]);

  const fetchUserHistory = useCallback(
    async ({ mode }) => {
      // mode: "replace" (page=1) | "append" (page>1)
      if (mode === "append") setIsLoadingMore(true);
      else setIsLoading(true);

      setError(null);

      try {
        if (!adminKey) {
          throw {
            status: 0,
            message: "Admin key is missing. Set VITE_ADMIN_KEY or localStorage adminKey.",
          };
        }

        if (!userId) {
          throw {
            status: 400,
            message:
              "Missing or invalid userId from selected user (expected user.userId or user.id).",
            details: { user },
          };
        }

        const qs = new URLSearchParams();
        qs.set("page", String(page));
        qs.set("pageSize", String(pageSize));
        if (search?.trim()) qs.set("search", search.trim());

        const url = `${API_BASE_URL}/api/admin/users/${userId}/prompts?${qs.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-ADMIN-KEY": adminKey,
          },
        });

        if (!response.ok) {
          const data = await safeJson(response);
          const text = data ? null : await response.text().catch(() => "");
          throw {
            status: response.status,
            data,
            traceId: data?.traceId || data?.extensions?.traceId || null,
            message:
              data?.title ||
              data?.message ||
              `Failed to fetch user history (${response.status} ${response.statusText})${
                text ? ` - ${text}` : ""
              }`,
          };
        }

        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const totalCount = Number.isFinite(Number(data?.total))
          ? Number(data.total)
          : items.length;

        setTotal(totalCount);

        // ✅ THE CORE CHANGE: append instead of replace
        setHistory((prev) => (page === 1 ? items : [...prev, ...items]));
      } catch (err) {
        const normalized =
          err?.status != null ? err : { status: 0, message: err?.message || "Network error" };

        setError(normalized);
        setHistory([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [adminKey, page, search, userId, user]
  );

  // Load page 1 (replace) whenever modal opens / user changes / search changes
  useEffect(() => {
    if (!isOpen || !user) return;
    fetchUserHistory({ mode: "replace" });
  }, [isOpen, userId, search, fetchUserHistory, user]);

  // When page > 1, we append
  useEffect(() => {
    if (!isOpen || !user) return;
    if (page <= 1) return;
    fetchUserHistory({ mode: "append" });
  }, [page, isOpen, user, fetchUserHistory]);

  const toggleExpanded = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!user) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      {/* ✅ FIX SCROLL: use flex layout + fixed height */}
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 bg-white flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
          <DialogTitle className="text-xl font-semibold text-slate-800 mb-3">
            User Learning History
          </DialogTitle>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white text-slate-700 border-slate-200">
              <User className="w-3 h-3 mr-1" />
              {user.name}
            </Badge>
            <Badge variant="secondary" className="bg-white text-slate-700 border-slate-200">
              <Phone className="w-3 h-3 mr-1" />
              {user.phone}
            </Badge>
            <Badge variant="secondary" className="bg-white text-slate-700 border-slate-200">
              <Hash className="w-3 h-3 mr-1" />
              ID: {userId ?? "—"}
            </Badge>
          </div>
        </DialogHeader>

        {/* ✅ FIX SCROLL: ScrollArea gets remaining height */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Search inside history */}
            <Card className="mb-4 shadow-sm bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                      setHistory([]);
                      setExpandedItems({});
                    }}
                    placeholder="Search prompts/responses..."
                    className="pl-9 h-10 bg-slate-50 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Unexpected errors (network/5xx) with TraceId */}
            {error && isUnexpectedError(error) && (
              <div className="mb-4">
                <UnexpectedErrorAlert
                  error={error}
                  message="Something went wrong while loading user history."
                />
              </div>
            )}

            {isLoading && history.length === 0 ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error?.message || "Unknown error"}</AlertDescription>
              </Alert>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No History Found</h3>
                <p className="text-slate-500 text-sm text-center">
                  This user hasn&apos;t generated any lessons yet
                </p>
              </div>
            ) : (
              <>
                {/* Info row */}
                <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
                  <div>
                    Showing <span className="font-medium">{history.length}</span> of{" "}
                    <span className="font-medium">{total}</span>
                  </div>
                  {isLoadingMore && (
                    <div className="inline-flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading more...
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div
                      key={item.id ?? index}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors bg-white"
                    >
                      {/* Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {item.createdAt && (
                            <Badge variant="outline" className="text-slate-600 border-slate-200">
                              <Calendar className="w-3 h-3 mr-1" />
                              {moment(item.createdAt).format("MMM D, YYYY h:mm A")}
                            </Badge>
                          )}
                          {item.categoryName && (
                            <Badge
                              variant="secondary"
                              className="bg-indigo-100 text-indigo-700 border-indigo-200"
                            >
                              <FolderTree className="w-3 h-3 mr-1" />
                              {item.categoryName}
                            </Badge>
                          )}
                          {item.subCategoryName && (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 border-purple-200"
                            >
                              <Layers className="w-3 h-3 mr-1" />
                              {item.subCategoryName}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Prompt */}
                      <div className="p-4 border-b border-slate-100 bg-white">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Prompt
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{item.prompt}</p>
                      </div>

                      {/* Summary (optional) */}
                      {item.summary && (
                        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <div className="flex items-start gap-2 mb-2">
                            <FileText className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                              Quick Summary
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{item.summary}</p>
                        </div>
                      )}

                      {/* Response */}
                      <div className="p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            AI Response
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(index)}
                            className="h-7 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            {expandedItems[index] ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Expand
                              </>
                            )}
                          </Button>
                        </div>

                        <div
                          className={`prose prose-slate prose-sm max-w-none ${
                            !expandedItems[index] ? "line-clamp-3" : ""
                          }`}
                        >
                          <ReactMarkdown>{item.response || "No content available"}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load more button */}
                {canLoadMore && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={isLoadingMore}
                      className="border-slate-200 hover:bg-white"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load more"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
