import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderTree, Layers } from "lucide-react";

export default function CategorySelector({
  categories,
  isLoading,
  error,
  selectedCategoryId,
  selectedSubCategoryId,
  subCategories,
  onCategoryChange,
  onSubCategoryChange,
}) {
  const safeCategories = categories || [];

  const computedSubCats = useMemo(() => {
    if (subCategories) return subCategories; 
    const selected = safeCategories.find((c) => String(c.id) === String(selectedCategoryId || ""));
    return selected?.subCategories || [];
  }, [subCategories, safeCategories, selectedCategoryId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
        <p className="text-red-600 text-sm">Failed to load categories</p>
        <p className="text-red-400 text-xs mt-1">{String(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-indigo-500" />
          Category
        </Label>
        <Select
          value={selectedCategoryId != null ? String(selectedCategoryId) : ""}
          onValueChange={(value) => onCategoryChange?.(value)}
        >
          <SelectTrigger className="h-11 bg-white border-slate-200 hover:border-slate-300 focus:ring-indigo-200">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            {safeCategories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 font-medium flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" />
          Sub-Category
        </Label>
        <Select
          value={selectedSubCategoryId != null ? String(selectedSubCategoryId) : ""}
          onValueChange={(value) => onSubCategoryChange?.(value)}
          disabled={!selectedCategoryId || computedSubCats.length === 0}
        >
          <SelectTrigger className="h-11 bg-white border-slate-200 hover:border-slate-300 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue
              placeholder={
                !selectedCategoryId
                  ? "Select a category first"
                  : computedSubCats.length === 0
                    ? "No sub-categories available"
                    : "Select a sub-category"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            {computedSubCats.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
