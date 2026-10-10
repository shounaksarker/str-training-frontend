import { ArrowDown, BarChart3, BookOpenText, CheckCircle2, Clock3, Layers3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardResult } from "@/lib/api/types";
import { PropertyCard } from "./property-card";

function DashboardHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold tracking-widest text-white">STR</span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-slate-900">STR Search</p>
            <p className="text-xs text-slate-500">Analyst training</p>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">Training workspace</span>
      </div>
    </header>
  );
}

function SummaryCard({ label, value, icon: Icon, detail }: {
  label: string;
  value: string;
  icon: typeof Layers3;
  detail: string;
}) {
  return (
    <Card className="rounded-2xl border-0 py-0 shadow-sm ring-1 ring-slate-200">
      <CardContent className="flex items-start justify-between gap-4 px-5 py-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{detail}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

export function Dashboard({ data }: { data: DashboardResult }) {
  const { summary, properties } = data;
  const progress = summary.total_properties > 0 ? Math.round((summary.submitted / summary.total_properties) * 100) : 0;
  const average = summary.average_accuracy === null ? "—" : `${Math.round(Number(summary.average_accuracy))}%`;

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pt-10">
        <section className="relative overflow-hidden rounded-[28px] bg-[#13243a] px-7 py-9 text-white sm:px-10 sm:py-10">
          <div aria-hidden="true" className="absolute -right-20 -top-28 size-90 rounded-full border border-white/10 bg-teal-300/5" />
          <div aria-hidden="true" className="absolute -bottom-56 right-36 size-96 rounded-full border border-white/10" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_250px] md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-100">
                <BookOpenText aria-hidden="true" className="size-3.5" /> ANALYST DEVELOPMENT
              </div>
              <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Build your underwriting instincts.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Choose a property, model the investment, and compare your revenue forecast with an analyst&apos;s after submission.
              </p>
              <Link href="#cases" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Explore cases <ArrowDown aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-end justify-between">
                <p className="text-sm text-slate-300">Your progress</p>
                <p className="text-2xl font-semibold">{progress}%</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Training cases submitted" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-teal-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-300">{summary.submitted} of {summary.total_properties} cases submitted</p>
            </div>
          </div>
        </section>

        <section aria-label="Training overview" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Available cases" value={String(summary.total_properties)} icon={Layers3} detail="Properties ready to practice" />
          <SummaryCard label="Submitted" value={String(summary.submitted)} icon={CheckCircle2} detail="Completed underwritings" />
          <SummaryCard label="In progress" value={String(summary.in_progress)} icon={Clock3} detail="Drafts you can resume" />
          <SummaryCard label="Average accuracy" value={average} icon={BarChart3} detail="Across your submitted cases" />
        </section>

        <section id="cases" className="scroll-mt-6 pt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">CASE LIBRARY</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Choose a property</h2>
              <p className="mt-1 text-sm text-slate-500">Each case has a hidden analyst reference for your evaluation.</p>
            </div>
            <p className="text-sm font-medium text-slate-500">{properties.length} properties</p>
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => <PropertyCard key={property.zpid} property={property} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <h3 className="text-lg font-semibold">No cases available yet</h3>
              <p className="mt-2 text-sm text-slate-500">Check back when training properties have been added.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export function DashboardUnavailable() {
  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-600"><BarChart3 aria-hidden="true" className="size-7" /></div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">Training cases are unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">We couldn&apos;t load the dashboard. Check that the backend is running, then try again.</p>
        <Link href="/" className="mt-6 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Try again</Link>
      </main>
    </div>
  );
}
