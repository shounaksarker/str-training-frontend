import { ArrowLeft, ArrowUpRight, Bath, BedDouble, House, MapPin, Ruler } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CaseHeader } from "@/features/training/components/case-header";
import { StartCaseButton } from "@/features/training/components/start-case-button";
import { BackendApiError } from "@/lib/api/client";
import { getDashboard } from "@/lib/api/dashboard";
import { getProperty } from "@/lib/api/properties";
import type { DashboardProperty, PropertyRead } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function PropertyPage({ params }: { params: Promise<{ zpid: string }> }) {
  const { zpid } = await params;
  let property: PropertyRead;
  let progress: DashboardProperty | undefined;

  try {
    const [propertyResult, dashboard] = await Promise.all([getProperty(zpid), getDashboard()]);
    property = propertyResult;
    progress = dashboard.properties.find((item) => item.zpid === zpid);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) notFound();
    console.error("Unable to render property", error);
    return (
      <div className="min-h-screen bg-[#f6f7f9]"><CaseHeader />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="text-2xl font-semibold">Property unavailable</h1>
          <p className="mt-2 text-slate-600">Check that the backend is running, then refresh this page.</p>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-teal-700">Back to cases</Link>
        </main>
      </div>
    );
  }

  const address = property.address ?? [property.address_street, property.address_city, property.address_state].filter(Boolean).join(", ");
  const activeId = progress?.active_underwriting_id;

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <CaseHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft aria-hidden="true" className="size-4" /> Back to all cases</Link>
        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="relative flex h-60 items-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#4c746f] via-[#36535c] to-[#1c3547] p-7 text-white sm:h-72">
              <div aria-hidden="true" className="absolute -right-14 -top-22 size-80 rounded-full border border-white/20 bg-white/5" />
              <House aria-hidden="true" className="absolute bottom-4 right-8 size-28 stroke-[1] text-white/30" />
              <div className="relative"><Badge className="bg-white/90 text-slate-800">{property.market?.name ?? "Training property"}</Badge><p className="mt-4 text-3xl font-semibold">{property.price ?? "Price unavailable"}</p></div>
            </div>
            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">PROPERTY OVERVIEW</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{property.address_street ?? address}</h1>
              <p className="mt-2 flex items-center gap-2 text-slate-600"><MapPin aria-hidden="true" className="size-4" />{[property.address_city, property.address_state, property.address_zipcode].filter(Boolean).join(", ")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {property.beds !== null && <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200"><BedDouble className="size-4 text-slate-500" />{property.beds} beds</span>}
                {property.baths !== null && <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200"><Bath className="size-4 text-slate-500" />{property.baths} baths</span>}
                {property.area !== null && <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200"><Ruler className="size-4 text-slate-500" />{property.area.toLocaleString()} sq ft</span>}
              </div>
            </div>
            {property.detail_url && <a href={property.detail_url} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900">View original listing <ArrowUpRight aria-hidden="true" className="size-4" /></a>}
          </div>
          <Card className="h-fit rounded-2xl border-0 p-6 shadow-sm ring-1 ring-slate-200">
            <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-700">YOUR CASE</p><h2 className="mt-2 text-xl font-semibold">Underwrite this property</h2><p className="mt-3 text-sm leading-6 text-slate-600">Build a purchase and revenue forecast, then submit your analysis to see how close your mid revenue estimate is to the analyst reference.</p></div>
            <div className="my-6 border-t border-slate-100" />
            <div className="space-y-3 text-sm text-slate-600"><p><span className="mr-3 font-semibold text-teal-700">01</span> Enter your assumptions</p><p><span className="mr-3 font-semibold text-teal-700">02</span> Save your draft</p><p><span className="mr-3 font-semibold text-teal-700">03</span> Submit and review results</p></div>
            <div className="mt-7">
              {activeId ? <Link href={`/underwritings/${activeId}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-700">Continue draft</Link> : <StartCaseButton zpid={property.zpid} />}
              {progress?.latest_submission_id ? <p className="mt-3 text-sm"><Link href={`/submissions/${progress.latest_submission_id}`} className="font-medium text-teal-700 hover:text-teal-900">View latest result</Link><span className="ml-2 text-xs text-slate-500">· {progress.attempts} {progress.attempts === 1 ? "attempt" : "attempts"}</span></p> : null}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
