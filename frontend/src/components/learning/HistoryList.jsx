import React, { useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RefreshCw, Eye, Clock, FolderTree, Layers, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

export default function HistoryList({
  history,
  isLoading,
  error,
  onRefresh,
  onViewItem,
}) {
  const didAutoLoadRef = useRef(false);

  // ✅ AUTO LOAD פעם אחת בכניסה למסך
  useEffect(() => {
    if (didAutoLoadRef.current) return;
    didAutoLoadRef.current = true;

    // אל תרוץ אם אין callback
    if (typeof onRefresh === "function") {
      onRefresh();
    }
  }, [onRefresh]);

  const sortedHistory = useMemo(() => {
    return [...(history || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [history]);

  const truncateText = (text, max = 80) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };

  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Learning History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="border-slate-200 hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm">{String(error)}</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="mt-3">
              Try again
            </Button>
          </div>
        ) : sortedHistory.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">No history yet</p>
            <p className="text-slate-400 text-xs mt-1">Your generated lessons will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {sortedHistory.map((item, index) => (
                  <motion.div
                    key={item.id ?? `${item.createdAt}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 mb-2 line-clamp-2">
                          {truncateText(item.prompt, 80)}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.categoryName && (
                            <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0">
                              <FolderTree className="w-2.5 h-2.5 mr-1" />
                              {item.categoryName}
                            </Badge>
                          )}
                          {item.subCategoryName && (
                            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-600 px-2 py-0">
                              <Layers className="w-2.5 h-2.5 mr-1" />
                              {item.subCategoryName}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.createdAt ? moment(item.createdAt).format("MMM D, YYYY h:mm A") : ""}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewItem?.(item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
