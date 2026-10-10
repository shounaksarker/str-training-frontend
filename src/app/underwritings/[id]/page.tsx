import { ArrowLeft, CheckCircle2, CircleDashed, ClipboardList, House } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CaseHeader } from "@/features/training/components/case-header";
import { BackendApiError } from "@/lib/api/client";
import { getUnderwriting } from "@/lib/api/underwritings";
import type { UnderwritingRead } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function UnderwritingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isSafeInteger(parsedId) || parsedId < 1) notFound();

  let underwriting: UnderwritingRead;
  try {
    underwriting = await getUnderwriting(parsedId);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) notFound();
    console.error("Unable to render underwriting", error);
    return <div className="min-h-screen bg-[#f6f7f9]"><CaseHeader /><main className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-2xl font-semibold">Case unavailable</h1><p className="mt-2 text-slate-600">Check that the backend is running, then refresh this page.</p><Link href="/" className="mt-5 inline-block text-sm font-semibold text-teal-700">Back to cases</Link></main></div>;
  }

  if (underwriting.is_reference) notFound();
  const isSubmitted = underwriting.deal_status === "submitted";
  const address = underwriting.property_address ?? [underwriting.street, underwriting.city, underwriting.state].filter(Boolean).join(", ");
  const hasAssumptions = Boolean(underwriting.detail?.purchase_details || underwriting.detail?.forecasted_revenue);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <CaseHeader />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8">
        <Link href={underwriting.zpid ? `/properties/${underwriting.zpid}` : "/"} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft aria-hidden="true" className="size-4" /> Back to property</Link>
        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">UNDERWRITING · CASE #{underwriting.id}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{address || "Training case"}</h1><p className="mt-2 text-sm text-slate-500">{[underwriting.city, underwriting.state].filter(Boolean).join(", ")}</p></div>
          <Badge className={isSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>{isSubmitted ? "Submitted" : "Draft in progress"}</Badge>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
          <Card className="h-fit rounded-2xl border-0 p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Case progress</p>
            <ol className="mt-5 space-y-5">
              <li className="flex items-start gap-3 text-sm"><CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-teal-700" /><div><p className="font-semibold">Property selected</p><p className="mt-0.5 text-xs text-slate-500">Case created</p></div></li>
              <li className="flex items-start gap-3 text-sm"><CircleDashed aria-hidden="true" className="size-5 shrink-0 text-amber-600" /><div><p className="font-semibold">Build forecast</p><p className="mt-0.5 text-xs text-slate-500">{hasAssumptions ? "Assumptions saved" : "Purchase and revenue assumptions"}</p></div></li>
              <li className="flex items-start gap-3 text-sm"><CircleDashed aria-hidden="true" className="size-5 shrink-0 text-slate-400" /><div><p className="font-semibold">Review result</p><p className="mt-0.5 text-xs text-slate-500">After submission</p></div></li>
            </ol>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-2xl border-0 p-7 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><ClipboardList aria-hidden="true" className="size-5" /></span><div><h2 className="text-xl font-semibold">Your analysis</h2><p className="mt-1 text-sm leading-6 text-slate-600">Estimate this property&apos;s purchase terms and short-term rental revenue. Your mid revenue forecast is used to measure accuracy when you submit.</p></div></div>
            <div className="mt-7 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7"><p className="text-sm font-medium text-slate-700">Financial assumptions</p><p className="mt-1 text-sm text-slate-500">The purchase and revenue form is the next part of this workspace.</p></div>
          </Card>
          <Card className="rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-3"><House aria-hidden="true" className="size-5 text-slate-500" /><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Selected property</p><p className="mt-1 text-sm font-semibold">{address || underwriting.zpid}</p></div></div>{underwriting.zpid && <Link href={`/properties/${underwriting.zpid}`} className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:text-teal-900">View property details</Link>}</Card>
          </div>
        </div>
      </main>
    </div>
  );
}
