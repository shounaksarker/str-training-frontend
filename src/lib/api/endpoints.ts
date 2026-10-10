export const BACKEND_ENDPOINTS = {
  dashboard: "/api/dashboard",
  property: (zpid: string) => `/api/properties/${encodeURIComponent(zpid)}`,
  underwritings: "/api/underwritings",
  underwriting: (id: number) => `/api/underwritings/${id}`,
} as const;
