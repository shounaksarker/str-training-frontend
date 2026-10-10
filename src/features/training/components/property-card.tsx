import { ArrowUpRight, Bath, BedDouble, House, MapPin, Ruler } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DashboardProperty, TrainingStatus } from "@/lib/api/types";

const statusLabels: Record<TrainingStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
};

const statusStyles: Record<TrainingStatus, string> = {
  not_started: "bg-white/95 text-slate-700",
  in_progress: "bg-amber-50 text-amber-800",
  submitted: "bg-emerald-50 text-emerald-800",
};

const coverStyles: Record<number, string> = {
  1: "from-[#4d6d66] to-[#233f45]",
  2: "from-[#987258] to-[#514b45]",
  3: "from-[#4e7491] to-[#30495f]",
  4: "from-[#798b91] to-[#4d656b]",
};

function getCaseLink(property: DashboardProperty) {
  // todo: property status -> should be in "constants"
  if (property.status === "in_progress" && property.active_underwriting_id) {
    return `/underwritings/${property.active_underwriting_id}`;
  }
  if (property.status === "submitted" && property.latest_submission_id) {
    return `/submissions/${property.latest_submission_id}`;
  }
  return `/properties/${property.zpid}`;
}

export function PropertyCard({ property }: { property: DashboardProperty }) {
  const street = property.address?.split(",")[0] ?? "Address unavailable";
  const place = [property.city, property.state].filter(Boolean).join(", ");
  const action = property.status === "in_progress" ? "Continue case" : property.status === "submitted" ? "View result" : "Start case";
  const accuracy = property.latest_accuracy === null ? null : Math.round(Number(property.latest_accuracy));
  const bestAccuracy = property.best_accuracy === null ? null : Math.round(Number(property.best_accuracy));

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 py-0 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md">
      <div className={`relative h-44 overflow-hidden bg-linear-to-br ${coverStyles[property.market_id ?? 0] ?? "from-slate-500 to-slate-700"}`}>
        <div aria-hidden="true" className="absolute -bottom-30 -right-10 size-70 rounded-full border border-white/20 bg-white/5" />
        <div aria-hidden="true" className="absolute -bottom-22 right-20 size-52 rounded-full border border-white/15" />
        <House aria-hidden="true" className="absolute bottom-6 right-7 size-20 stroke-[1.1] text-white/35" />
        <div className="absolute left-5 top-5 flex max-w-[70%] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{property.market_name ?? "Unassigned market"}</span>
        </div>
        <Badge className={`absolute right-5 top-5 shadow-sm ${statusStyles[property.status]}`}>
          {statusLabels[property.status]}
        </Badge>
        <div className="absolute bottom-4 left-5 text-sm font-semibold text-white">
          {property.price ?? "Price unavailable"}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{street}</h3>
          <p className="mt-1 text-sm text-slate-500">{place || "Location unavailable"}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-100 pb-5 text-sm text-slate-600">
          {property.beds !== null && <span className="inline-flex items-center gap-1.5"><BedDouble aria-hidden="true" className="size-4" />{property.beds} beds</span>}
          {property.baths !== null && <span className="inline-flex items-center gap-1.5"><Bath aria-hidden="true" className="size-4" />{property.baths} baths</span>}
          {property.area !== null && <span className="inline-flex items-center gap-1.5"><Ruler aria-hidden="true" className="size-4" />{property.area.toLocaleString()} sq ft</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Latest result</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {accuracy === null ? "No attempts yet" : `${accuracy}% accuracy`}
            </p>
            {bestAccuracy !== null && (
              <p className="mt-0.5 text-xs text-slate-500">Best {bestAccuracy}% · {property.attempts} {property.attempts === 1 ? "attempt" : "attempts"}</p>
            )}
          </div>
          <Link
            href={getCaseLink(property)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            aria-label={`${action}: ${street}`}
          >
            {action}<ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
