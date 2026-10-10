import { fetchBackend } from "./client";
import { BACKEND_ENDPOINTS } from "./endpoints";
import type { DashboardResult } from "./types";

export function getDashboard(): Promise<DashboardResult> {
  return fetchBackend<DashboardResult>(BACKEND_ENDPOINTS.dashboard);
}
