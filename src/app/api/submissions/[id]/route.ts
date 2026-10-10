import { BackendApiError } from "@/lib/api/client";
import { getSubmission } from "@/lib/api/submissions";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isSafeInteger(parsedId) || parsedId < 1) {
    return Response.json({ detail: "Invalid submission ID" }, { status: 400 });
  }

  try {
    const res = await getSubmission(parsedId);
    return Response.json(res);
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to load submission", error);
    return Response.json({ detail: "Result is temporarily unavailable" }, { status: 502 });
  }
}
