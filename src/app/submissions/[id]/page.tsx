import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Trophy, Target } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CaseHeader } from "@/features/training/components/case-header";
import { BackendApiError } from "@/lib/api/client";
import { getSubmission, getSubmissions } from "@/lib/api/submissions";
import { getUnderwriting } from "@/lib/api/underwritings";
import type { SubmissionRead, UnderwritingRead } from "@/lib/api/types";

export const dynamic = "force-dynamic";

const ratingContent = {
  best: { title: "Excellent match", description: "Your Mid revenue forecast is within 10% of the analyst reference.", color: "text-emerald-700", surface: "bg-emerald-50" },
  medium: { title: "Getting close", description: "Your Mid revenue forecast is within 25% of the analyst reference.", color: "text-amber-700", surface: "bg-amber-50" },
  low: { title: "Keep practicing", description: "Your Mid revenue forecast is more than 25% from the analyst reference.", color: "text-sky-700", surface: "bg-sky-50" },
} as const;

function money(value: string | null) {
  return value === null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
}

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isSafeInteger(parsedId) || parsedId < 1) notFound();

  let submission: SubmissionRead;
  let underwriting: UnderwritingRead;
  let submissions: SubmissionRead[];
  try {
    [submission, submissions] = await Promise.all([getSubmission(parsedId), getSubmissions()]);
    underwriting = await getUnderwriting(submission.underwriting_id);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) notFound();
    console.error("Unable to render submission", error);
    return <div className="min-h-screen bg-[#f6f7f9]"><CaseHeader /><main className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-2xl font-semibold">Result unavailable</h1><p className="mt-2 text-slate-600">Check that the backend is running, then refresh this page.</p><Link href="/" className="mt-5 inline-block text-sm font-semibold text-teal-700">Back to cases</Link></main></div>;
  }

  const rating = ratingContent[submission.rating];
  const score = Math.round(Number(submission.accuracy));
  const deviation = (Number(submission.breakdown.deviation) * 100).toFixed(1);
  const candidate = Number(submission.breakdown.candidate);
  const reference = Number(submission.breakdown.reference);
  const comparison = candidate === reference
    ? "Your Mid forecast exactly matches the analyst reference."
    : `Your Mid forecast is ${deviation}% ${candidate > reference ? "above" : "below"} the analyst reference.`;
  const sortedSubmissions = [...submissions].sort((a, b) => Number(b.accuracy) - Number(a.accuracy) || a.id - b.id);
  const rank = sortedSubmissions.filter((item) => Number(item.accuracy) > Number(submission.accuracy)).length + 1;
  const address = underwriting.property_address ?? [underwriting.street, underwriting.city, underwriting.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <CaseHeader />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft aria-hidden="true" className="size-4" /> All cases</Link>
        <div className="mt-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">YOUR RESULT · SUBMISSION #{submission.id}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{address || "Training case"}</h1><p className="mt-2 text-sm text-slate-500">Submitted {new Date(submission.submitted_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>

        <Card className="mt-8 overflow-hidden rounded-2xl border-0 p-0 shadow-sm ring-1 ring-slate-200">
          <div className="grid md:grid-cols-[260px_1fr]">
            <div className={`flex flex-col justify-center p-7 ${rating.surface}`}><p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Accuracy score</p><p className={`mt-3 text-6xl font-semibold tracking-tight ${rating.color}`}>{score}<span className="text-2xl">/100</span></p></div>
            <div className="p-7 sm:p-8"><span className={`inline-flex size-11 items-center justify-center rounded-xl ${rating.surface} ${rating.color}`}><CheckCircle2 aria-hidden="true" className="size-6" /></span><h2 className="mt-4 text-2xl font-semibold">{rating.title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{rating.description}</p><p className="mt-4 text-sm font-medium text-slate-700">{comparison}</p></div>
          </div>
        </Card>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Card className="rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-3"><Target aria-hidden="true" className="size-5 text-teal-700" /><h2 className="text-lg font-semibold">Revenue comparison</h2></div><p className="mt-2 text-sm text-slate-500">Only the Mid annual revenue forecast affects your score.</p><div className="mt-6 grid grid-cols-2 gap-4"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Your Mid forecast</p><p className="mt-1 text-xl font-semibold">{money(submission.breakdown.candidate)}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Analyst reference</p><p className="mt-1 text-xl font-semibold">{money(submission.breakdown.reference)}</p></div></div></Card>
          <Card className="rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-3"><BarChart3 aria-hidden="true" className="size-5 text-teal-700" /><h2 className="text-lg font-semibold">How scoring works</h2></div><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between rounded-lg bg-emerald-50 px-4 py-3"><span>Within 10% deviation</span><strong>100 points</strong></div><div className="flex justify-between rounded-lg bg-amber-50 px-4 py-3"><span>Over 10%, up to 25%</span><strong>70 points</strong></div><div className="flex justify-between rounded-lg bg-sky-50 px-4 py-3"><span>Over 25%</span><strong>40 points</strong></div></div></Card>
        </div>

        <Card className="mt-6 rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><Trophy aria-hidden="true" className="size-5 text-teal-700" /><div><h2 className="text-lg font-semibold">Training leaderboard</h2><p className="mt-1 text-sm text-slate-500">All scored attempts across the training cases</p></div></div><p className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">Your rank: #{rank} of {sortedSubmissions.length}</p></div>
          <ol className="mt-5 divide-y divide-slate-100">
            {sortedSubmissions.slice(0, 5).map((item) => {
              const itemRank = sortedSubmissions.filter((other) => Number(other.accuracy) > Number(item.accuracy)).length + 1;
              return <li key={item.id} className={`flex items-center justify-between gap-3 py-3 text-sm ${item.id === submission.id ? "font-semibold text-teal-800" : "text-slate-700"}`}><span>#{itemRank} · {item.id === submission.id ? "Your attempt" : `Submission #${item.id}`}</span><span>{Math.round(Number(item.accuracy))}/100</span></li>;
            })}
          </ol>
          {sortedSubmissions.findIndex((item) => item.id === submission.id) >= 5 && <p className="mt-2 text-sm font-medium text-teal-800">Your submission #{submission.id} is ranked #{rank}.</p>}
        </Card>

        <div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700">Explore other cases <ArrowRight aria-hidden="true" className="size-4" /></Link><Link href={`/properties/${submission.zpid}`} className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Try this property again</Link></div>
      </main>
    </div>
  );
}
