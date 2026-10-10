"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EditableLineItem {
  key: string;
  label: string;
  amount: string;
}

export function LineItemsEditor({ title, description, nameLabel, amountLabel, addLabel, items, onChange }: {
  title: string;
  description: string;
  nameLabel: string;
  amountLabel: string;
  addLabel: string;
  items: EditableLineItem[];
  onChange: (items: EditableLineItem[]) => void;
}) {
  function change(key: string, field: "label" | "amount", value: string) {
    onChange(items.map((item) => item.key === key ? { ...item, [field]: value } : item));
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { key: crypto.randomUUID(), label: "", amount: "" }])}><Plus aria-hidden="true" />{addLabel}</Button>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No items added. Add one if this deal has {title.toLowerCase()}.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={item.key} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_170px_auto] sm:items-end">
              <label className="block"><span className="text-xs font-medium text-slate-600">{nameLabel} {index + 1}</span><input type="text" value={item.label} onChange={(event) => change(item.key, "label", event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" placeholder={nameLabel} /></label>
              <label className="block"><span className="text-xs font-medium text-slate-600">{amountLabel}</span><span className="relative mt-1.5 block"><span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span><input type="number" min="0" step="0.01" value={item.amount} onChange={(event) => change(item.key, "amount", event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-7 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" /></span></label>
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(items.filter((row) => row.key !== item.key))} aria-label={`Remove ${nameLabel.toLowerCase()} ${index + 1}`} className="text-slate-500 hover:text-red-700"><Trash2 aria-hidden="true" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
