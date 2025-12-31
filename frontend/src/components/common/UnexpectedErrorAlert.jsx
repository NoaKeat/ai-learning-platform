import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getTraceId } from "@/api/apiErrors";

export default function UnexpectedErrorAlert({ error, message }) {
  if (!error) return null;

  const traceId = getTraceId(error);

  return (
    <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4" />
      <div>
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="space-y-1">
          <div>{message || "Please try again later."}</div>
          {traceId && (
            <div className="text-xs text-slate-500">
              Trace ID: <span className="font-mono">{traceId}</span>
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
