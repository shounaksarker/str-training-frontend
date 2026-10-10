export const BACKEND_ENDPOINTS = {
  dashboard: "/api/dashboard",
  property: (zpid: string) => `/api/properties/${encodeURIComponent(zpid)}`,
  underwritings: "/api/underwritings",
  underwriting: (id: number) => `/api/underwritings/${id}`,
  submitUnderwriting: (id: number) => `/api/underwritings/${id}/submit`,
  submission: (id: number) => `/api/submissions/${id}`,
  submissions: "/api/submissions",
} as const;
