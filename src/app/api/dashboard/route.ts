import { BackendApiError } from "@/lib/api/client";
import { getDashboard } from "@/lib/api/dashboard";

export async function GET() {
  try {
    return Response.json(await getDashboard());
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }

    console.error("Unable to load training dashboard", error);
    return Response.json(
      { detail: "Training data is temporarily unavailable" },
      { status: 502 },
    );
  }
}
