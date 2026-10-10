import { fetchBackend } from "./client";
import { BACKEND_ENDPOINTS } from "./endpoints";
import type { PropertyRead } from "./types";

export function getProperty(zpid: string): Promise<PropertyRead> {
  return fetchBackend<PropertyRead>(BACKEND_ENDPOINTS.property(zpid));
}
