import { Dashboard, DashboardUnavailable } from "@/features/training/components/dashboard";
import { getDashboard } from "@/lib/api/dashboard";
import type { DashboardResult } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data: DashboardResult;
  try {
    data = await getDashboard();
  } catch (error) {
    console.error("Unable to render training dashboard", error);
    return <DashboardUnavailable />;
  }

  return <Dashboard data={data} />;
}
