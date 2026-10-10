import { fetchBackend } from "./client";
import { BACKEND_ENDPOINTS } from "./endpoints";
import type { SaveUnderwritingPayload, UnderwritingRead } from "./types";

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

export function saveUnderwriting(id: number, payload: SaveUnderwritingPayload): Promise<UnderwritingRead> {
  return fetchBackend<UnderwritingRead>(BACKEND_ENDPOINTS.underwriting(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
