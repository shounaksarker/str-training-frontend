export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

export async function fetchBackend<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";
  const response = await fetch(new URL(path, baseUrl), {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Backend request failed";
    throw new BackendApiError(detail, response.status);
  }

  return (await response.json()) as T;
}
