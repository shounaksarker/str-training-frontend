"use client";

import { ArrowRight, Check, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SaveUnderwritingPayload, UnderwritingRead } from "@/lib/api/types";

type FormValues = {
  purchasePrice: string;
  downPayment: string;
  interestRate: string;
  mortgageYears: string;
  closingCosts: string;
  lowRevenue: string;
  midRevenue: string;
  highRevenue: string;
  coHostingFee: string;
  appreciation: string;
  landAssumptions: string;
  slaMultiplier: string;
  bonusAmount: string;
  taxRate: string;
};

function displayPercent(value: string | null | undefined) {
  return value == null ? "" : String(Number((Number(value) * 100).toFixed(4)));
}

function initialValues(underwriting: UnderwritingRead): FormValues {
  const purchase = underwriting.detail?.purchase_details;
  const revenue = underwriting.detail?.forecasted_revenue;
  const taxes = underwriting.taxes;
  return {
    purchasePrice: purchase?.purchase_price ?? underwriting.purchase_price ?? "",
    downPayment: displayPercent(purchase?.down_payment_pct),
    interestRate: displayPercent(purchase?.interest_rate),
    mortgageYears: purchase?.mortgage_years?.toString() ?? "",
    closingCosts: displayPercent(purchase?.closing_costs_pct),
    lowRevenue: revenue?.scenarios?.low?.forecasted_revenue ?? "",
    midRevenue: revenue?.scenarios?.mid?.forecasted_revenue ?? "",
    highRevenue: revenue?.scenarios?.high?.forecasted_revenue ?? "",
    coHostingFee: displayPercent(revenue?.co_hosting_fee_pct) || "0",
    appreciation: displayPercent(revenue?.annual_re_appreciation_pct) || "0",
    landAssumptions: displayPercent(taxes?.land_assumptions_pct),
    slaMultiplier: displayPercent(taxes?.sla_multiplier_pct),
    bonusAmount: displayPercent(taxes?.bonus_amount_pct),
    taxRate: displayPercent(taxes?.tax_rate_pct),
  };
}

function money(value: string | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
}

function percent(value: string | null) {
  return value === null ? "—" : `${(Number(value) * 100).toFixed(1)}%`;
}

function NumberField({ label, value, onChange, suffix, min = 0, max, step = "0.01", hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: "$" | "%" | "years";
  min?: number;
  max?: number;
  step?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="relative mt-2 block">
        {suffix === "$" && <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 ${suffix === "$" ? "pl-7 pr-3" : "pl-3 pr-14"}`}
        />
        {suffix !== "$" && <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{suffix}</span>}
      </span>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function UnderwritingForm({ initialUnderwriting }: { initialUnderwriting: UnderwritingRead }) {
  const router = useRouter();
  const [values, setValues] = useState(() => initialValues(initialUnderwriting));
  const [underwriting, setUnderwriting] = useState(initialUnderwriting);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setHasUnsavedChanges(true);
    setConfirming(false);
    setMessage(null);
    setError(null);
    setSubmitError(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fraction = (value: string) => String(Number(value) / 100);
    const payload: SaveUnderwritingPayload = {};
    const purchaseFields = [values.downPayment, values.interestRate, values.mortgageYears, values.closingCosts];
    const revenueFields = [values.lowRevenue, values.midRevenue, values.highRevenue];
    const taxFields = [values.landAssumptions, values.slaMultiplier, values.bonusAmount, values.taxRate];

    if (underwriting.detail?.purchase_details && (!values.purchasePrice || purchaseFields.some((field) => !field))) {
      setError("Complete the purchase section before saving it.");
      return;
    }
    if (underwriting.detail?.forecasted_revenue && revenueFields.some((field) => !field)) {
      setError("Complete all three revenue scenarios before saving them.");
      return;
    }
    if (underwriting.taxes?.land_assumptions_pct !== null && underwriting.taxes?.land_assumptions_pct !== undefined && taxFields.some((field) => !field)) {
      setError("Complete the tax section before saving it.");
      return;
    }

    if (purchaseFields.some(Boolean)) {
      if (!values.purchasePrice || purchaseFields.some((field) => !field)) {
        setError("Complete the purchase section before saving it.");
        return;
      }
      payload.purchase_details = {
        purchase_price: values.purchasePrice,
        down_payment_pct: fraction(values.downPayment),
        interest_rate: fraction(values.interestRate),
        mortgage_years: Number(values.mortgageYears),
        closing_costs_pct: fraction(values.closingCosts),
      };
    }

    if (revenueFields.some(Boolean)) {
      if (revenueFields.some((field) => !field)) {
        setError("Complete all three revenue scenarios before saving them.");
        return;
      }
      const [low, mid, high] = revenueFields.map(Number);
      if (low > mid || mid > high) {
        setError("Revenue should increase from Low to Mid to High.");
        return;
      }
      payload.forecasted_revenue = {
        co_hosting_fee_pct: fraction(values.coHostingFee),
        annual_re_appreciation_pct: fraction(values.appreciation),
        scenarios: {
          low: { forecasted_revenue: values.lowRevenue },
          mid: { forecasted_revenue: values.midRevenue },
          high: { forecasted_revenue: values.highRevenue },
        },
      };
    }

    if (taxFields.some(Boolean)) {
      if (taxFields.some((field) => !field)) {
        setError("Complete the tax section before saving it.");
        return;
      }
      payload.taxes = {
        land_assumptions_pct: fraction(values.landAssumptions),
        sla_multiplier_pct: fraction(values.slaMultiplier),
        bonus_amount_pct: fraction(values.bonusAmount),
        tax_rate_pct: fraction(values.taxRate),
      };
    }

    if (Object.keys(payload).length === 0) {
      setError("Complete at least one section before saving.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/underwritings/${underwriting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.detail === "string" ? data.detail : "Could not save this draft");
      }
      setUnderwriting(data as UnderwritingRead);
      setHasUnsavedChanges(false);
      setMessage(data.total_oop === null ? "Draft saved. Complete all three sections to see calculated returns." : "Draft saved. The figures below come from the backend calculation.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this draft");
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/underwritings/${underwriting.id}/submit`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.detail === "string" ? data.detail : "Could not submit this case");
      }
      router.replace(`/submissions/${data.submission.id}`);
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Could not submit this case");
      setSubmitting(false);
      setConfirming(false);
    }
  }

  const hasCalculation = underwriting.total_oop !== null;

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="space-y-5">
        <Card className="rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">01 · PURCHASE</p><h2 className="mt-2 text-xl font-semibold">Purchase details</h2><p className="mt-1 text-sm text-slate-600">Set your financing assumptions for this property.</p></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <NumberField label="Purchase price" value={values.purchasePrice} onChange={(value) => update("purchasePrice", value)} suffix="$" min={1} />
            <NumberField label="Down payment" value={values.downPayment} onChange={(value) => update("downPayment", value)} suffix="%" max={100} />
            <NumberField label="Interest rate" value={values.interestRate} onChange={(value) => update("interestRate", value)} suffix="%" max={100} />
            <NumberField label="Mortgage term" value={values.mortgageYears} onChange={(value) => update("mortgageYears", value)} suffix="years" min={1} step="1" />
            <NumberField label="Closing costs" value={values.closingCosts} onChange={(value) => update("closingCosts", value)} suffix="%" max={100} />
          </div>
        </Card>

        <Card className="rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">02 · REVENUE</p><h2 className="mt-2 text-xl font-semibold">Annual revenue forecast</h2><p className="mt-1 text-sm text-slate-600">Your Mid estimate is compared with the hidden analyst reference after submission.</p></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <NumberField label="Low scenario" value={values.lowRevenue} onChange={(value) => update("lowRevenue", value)} suffix="$" hint="Conservative annual revenue" />
            <NumberField label="Mid scenario" value={values.midRevenue} onChange={(value) => update("midRevenue", value)} suffix="$" hint="Your expected annual revenue" />
            <NumberField label="High scenario" value={values.highRevenue} onChange={(value) => update("highRevenue", value)} suffix="$" hint="Optimistic annual revenue" />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <NumberField label="Co-hosting fee" value={values.coHostingFee} onChange={(value) => update("coHostingFee", value)} suffix="%" max={100} />
            <NumberField label="Annual property appreciation" value={values.appreciation} onChange={(value) => update("appreciation", value)} suffix="%" max={100} />
          </div>
        </Card>

        <Card className="rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">03 · TAX</p><h2 className="mt-2 text-xl font-semibold">Tax assumptions</h2><p className="mt-1 text-sm text-slate-600">The backend needs these values to calculate returns.</p></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <NumberField label="Land assumption" value={values.landAssumptions} onChange={(value) => update("landAssumptions", value)} suffix="%" max={100} />
            <NumberField label="Short-life asset multiplier" value={values.slaMultiplier} onChange={(value) => update("slaMultiplier", value)} suffix="%" max={100} />
            <NumberField label="Bonus depreciation" value={values.bonusAmount} onChange={(value) => update("bonusAmount", value)} suffix="%" max={100} />
            <NumberField label="Tax rate" value={values.taxRate} onChange={(value) => update("taxRate", value)} suffix="%" max={100} />
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">Save completed sections now; finish the rest later.</p>
          <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-700">{saving ? <><LoaderCircle aria-hidden="true" className="animate-spin" /> Saving...</> : <><Save aria-hidden="true" /> Save draft</>}</Button>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check aria-hidden="true" className="size-4" />{message}</p>}
      </form>

      {hasCalculation && (
        <Card className="rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">BACKEND CALCULATION</p><h2 className="mt-2 text-xl font-semibold">Forecast snapshot</h2><p className="mt-1 text-sm text-slate-600">Updated when you save your draft.</p></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Total out of pocket</p><p className="mt-1 text-xl font-semibold">{money(underwriting.total_oop)}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Price to revenue ratio</p><p className="mt-1 text-xl font-semibold">{percent(underwriting.prr)}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Estimated tax savings</p><p className="mt-1 text-xl font-semibold">{money(underwriting.taxes?.tax_savings ?? null)}</p></div>
          </div>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-100 text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="pb-3 font-medium">Scenario</th><th className="pb-3 font-medium">Annual revenue</th><th className="pb-3 font-medium">Cash on cash</th></tr></thead><tbody className="divide-y divide-slate-100"><tr><th className="py-3 font-medium">Low</th><td>{money(underwriting.low_gross_revenue)}</td><td>{percent(underwriting.l_cash_on_cash)}</td></tr><tr><th className="py-3 font-medium">Mid</th><td>{money(underwriting.mid_gross_revenue)}</td><td>{percent(underwriting.m_cash_on_cash)}</td></tr><tr><th className="py-3 font-medium">High</th><td>{money(underwriting.high_gross_revenue)}</td><td>{percent(underwriting.h_cash_on_cash)}</td></tr></tbody></table></div>
        </Card>
      )}

      <Card className="rounded-2xl border-0 bg-[#13243a] p-6 text-white shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-200">FINAL STEP</p>
        <h2 className="mt-2 text-xl font-semibold">Submit your analysis</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Your saved Mid revenue forecast will be compared with the analyst reference. You can start a new attempt after reviewing the result.</p>
        {!hasCalculation && <p className="mt-4 text-sm text-amber-200">Complete and save purchase, revenue, and tax assumptions first.</p>}
        {hasCalculation && hasUnsavedChanges && <p className="mt-4 text-sm text-amber-200">Save your latest changes before submitting.</p>}
        {confirming ? (
          <div className="mt-5 rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold">Submit this saved forecast?</p>
            <p className="mt-1 text-sm text-slate-300">Mid annual revenue: {money(underwriting.mid_gross_revenue)}. The case becomes read-only after submission.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" disabled={submitting} onClick={submit} className="bg-white text-slate-900 hover:bg-slate-100">{submitting ? <><LoaderCircle aria-hidden="true" className="animate-spin" /> Submitting...</> : <>Confirm submission <ArrowRight aria-hidden="true" /></>}</Button>
              <Button type="button" variant="outline" disabled={submitting} onClick={() => setConfirming(false)} className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button type="button" disabled={!hasCalculation || hasUnsavedChanges || saving} onClick={() => setConfirming(true)} className="mt-5 bg-white text-slate-900 hover:bg-slate-100">Review & submit <ArrowRight aria-hidden="true" /></Button>
        )}
        {submitError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>}
      </Card>
    </div>
  );
}
