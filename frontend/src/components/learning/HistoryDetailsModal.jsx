import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Calendar, FolderTree, Layers, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import moment from "moment";

export default function HistoryDetailsModal({ item, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.response || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog
      open={Boolean(isOpen && item)}
      onOpenChange={(v) => {
        if (!v) onClose?.();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-slate-800">Lesson Details</DialogTitle>

              <div className="flex flex-wrap gap-2">
                {item.categoryName && (
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    <FolderTree className="w-3 h-3 mr-1" />
                    {item.categoryName}
                  </Badge>
                )}
                {item.subCategoryName && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Layers className="w-3 h-3 mr-1" />
                    {item.subCategoryName}
                  </Badge>
                )}
                {item.createdAt && (
                  <Badge variant="outline" className="text-slate-500 border-slate-200">
                    <Calendar className="w-3 h-3 mr-1" />
                    {moment(item.createdAt).format("MMM D, YYYY h:mm A")}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-slate-200 hover:bg-white shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-140px)]">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Your Prompt
              </h4>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-slate-700">{item.prompt}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-500">AI Response</h4>
              <div className="prose prose-slate prose-sm max-w-none">
                <ReactMarkdown>{item.response || "No content available"}</ReactMarkdown>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
