import { BackendApiError } from "@/lib/api/client";
import { submitUnderwriting } from "@/lib/api/underwritings";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isSafeInteger(parsedId) || parsedId < 1) {
    return Response.json({ detail: "Invalid case ID" }, { status: 400 });
  }

  try {
    const res = await submitUnderwriting(parsedId);
    return Response.json(res);
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to submit underwriting", error);
    return Response.json({ detail: "Could not submit this case. Please try again." }, { status: 502 });
  }
}
