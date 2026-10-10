import { fetchBackend } from "./client";
import { BACKEND_ENDPOINTS } from "./endpoints";
import type { MarketRead } from "./types";

export function getMarket(id: number): Promise<MarketRead> {
  return fetchBackend<MarketRead>(BACKEND_ENDPOINTS.market(id));
}
