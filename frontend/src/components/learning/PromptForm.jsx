import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function PromptForm({
  onSubmit,
  isDisabled,
  isSubmitting,
  disabledReason,
  error,
}) {
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState("");

  const canSubmit = useMemo(() => {
    return !isDisabled && !isSubmitting && text.trim().length >= 5;
  }, [isDisabled, isSubmitting, text]);

  const examplePrompts = [
    "Explain the basics of machine learning",
    "How does photosynthesis work?",
    "Introduction to JavaScript arrays",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (v.length < 5) {
      setLocalError("Prompt must be at least 5 characters");
      return;
    }
    setLocalError("");
    onSubmit?.(v);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          What would you like to learn?
        </Label>

        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (localError && e.target.value.trim().length >= 5) setLocalError("");
          }}
          placeholder="Enter your learning prompt... (e.g., Explain how neural networks work)"
          className={`min-h-[120px] bg-white border-slate-200 resize-none focus:ring-indigo-200 ${
            localError ? "border-red-300 focus:ring-red-200" : ""
          }`}
          disabled={isDisabled || isSubmitting}
        />

        {isDisabled && disabledReason && (
          <p className="text-xs text-slate-500">{disabledReason}</p>
        )}

        {localError && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500">
            {localError}
          </motion.p>
        )}

        {error && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500">
            {String(error)}
          </motion.p>
        )}

        {!isSubmitting && text.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {examplePrompts.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(example)}
                disabled={isDisabled || isSubmitting}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-200/50 disabled:opacity-50 disabled:shadow-none transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating lesson...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Lesson
          </>
        )}
      </Button>
    </form>
  );
}
