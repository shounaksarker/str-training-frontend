import { fetchBackend } from "./client";
import { BACKEND_ENDPOINTS } from "./endpoints";
import type { UnderwritingRead } from "./types";

export function getUnderwriting(id: number): Promise<UnderwritingRead> {
  return fetchBackend<UnderwritingRead>(BACKEND_ENDPOINTS.underwriting(id));
}

export function startUnderwriting(zpid: string): Promise<UnderwritingRead> {
  return fetchBackend<UnderwritingRead>(BACKEND_ENDPOINTS.underwritings, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zpid }),
  });
}
