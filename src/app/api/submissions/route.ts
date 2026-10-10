import { BackendApiError } from "@/lib/api/client";
import { getSubmissions } from "@/lib/api/submissions";

export async function GET() {
  try {
    const res = await getSubmissions();
    return Response.json(res);
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to load submissions", error);
    return Response.json({ detail: "Leaderboard is temporarily unavailable" }, { status: 502 });
  }
}
