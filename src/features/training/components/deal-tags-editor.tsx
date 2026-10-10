"use client";

import { DEAL_TAGS, type DealTagKey } from "@/lib/api/types";

export function DealTagsEditor({ values, onChange }: {
  values: Record<DealTagKey, boolean>;
  onChange: (values: Record<DealTagKey, boolean>) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {DEAL_TAGS.map(([key, label]) => (
        <label key={key} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${values[key] ? "border-teal-600 bg-teal-50 font-medium text-teal-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
          <input type="checkbox" checked={values[key]} onChange={(event) => onChange({ ...values, [key]: event.target.checked })} className="size-4 accent-teal-700" />
          {label}
        </label>
      ))}
    </div>
  );
}
