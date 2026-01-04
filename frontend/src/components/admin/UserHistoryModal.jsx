import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import UnexpectedErrorAlert from "@/components/common/UnexpectedErrorAlert";
import { isUnexpectedError } from "@/api/apiErrors";

import { getAdminUserPrompts } from "@/api/admin/adminApi";

import {
  Loader2,
  RefreshCw,
  AlertCircle,
  History,
  Search,
  Clock,
  FolderTree,
  Layers,
} from "lucide-react";

import moment from "moment";

export default function UserHistoryModal({ user, isOpen, onClose }) {
  const userId = user?.id;

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unexpectedError, setUnexpectedError] = useState(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / pageSize)),
    [total, pageSize]
  );

  const fetchHistoryWith = useCallback(
    async ({ userIdArg, pageArg, searchArg }) => {
      if (!userIdArg) return;

      setLoading(true);
      setError("");
      setUnexpectedError(null);

      try {
        const data = await getAdminUserPrompts(userIdArg, {
          page: pageArg,
          pageSize,
          search: searchArg,
        });

        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(Number(data?.total ?? data?.totalCount ?? 0));
      } catch (err) {
        if (isUnexpectedError(err)) {
          setUnexpectedError(err);
          setItems([]);
          setTotal(0);
          return;
        }
        setError(err?.message || "Failed to load user history.");
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    if (!isOpen || !userId) return;

    setPage(1);
    setSearch("");

    fetchHistoryWith({ userIdArg: userId, pageArg: 1, searchArg: "" });
  }, [isOpen, userId, fetchHistoryWith]);

  useEffect(() => {
    if (!isOpen || !userId) return;

    fetchHistoryWith({ userIdArg: userId, pageArg: page, searchArg: search });
  }, [isOpen, userId, page, search, fetchHistoryWith]);

  const onRefresh = () => {
    if (!userId) return;
    fetchHistoryWith({ userIdArg: userId, pageArg: page, searchArg: search });
  };

  return (
    <Dialog
      open={Boolean(isOpen)}
      onOpenChange={(v) => {
        if (!v) onClose?.();
      }}
    >
      <DialogContent className="max-w-4xl p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                {user?.name ? `History – ${user.name}` : "User History"}
              </DialogTitle>

              <div className="mt-2 flex flex-wrap gap-2">
                {user?.phone && (
                  <Badge
                    variant="secondary"
                    className="bg-white text-slate-700 border border-slate-200"
                  >
                    {user.phone}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="bg-white text-slate-700 border border-slate-200"
                >
                  User ID: {userId}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="border-slate-200 bg-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search in prompts..."
              className="pl-9 bg-white"
            />
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <UnexpectedErrorAlert error={unexpectedError} />

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
              <p className="text-sm text-slate-500 mt-3">Loading history...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No history found for this user.
            </div>
          ) : (
            <>
              <ScrollArea className="h-[420px] pr-2">
                <div className="divide-y divide-slate-100">
                  {items.map((it) => (
                    <div key={it.id} className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{it.prompt}</p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {it.categoryName && (
                              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                                <FolderTree className="w-3 h-3 mr-1" />
                                {it.categoryName}
                              </Badge>
                            )}
                            {it.subCategoryName && (
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                                <Layers className="w-3 h-3 mr-1" />
                                {it.subCategoryName}
                              </Badge>
                            )}
                            {it.createdAt && (
                              <Badge variant="outline" className="text-slate-500 border-slate-200">
                                <Clock className="w-3 h-3 mr-1" />
                                {moment(it.createdAt).format("MMM D, YYYY h:mm A")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>

                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages} • {total} items
                </span>

                <Button
                  variant="outline"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
