import { BackendApiError } from "@/lib/api/client";
import { getUnderwriting } from "@/lib/api/underwritings";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isSafeInteger(parsedId) || parsedId < 1) {
    return Response.json({ detail: "Invalid case ID" }, { status: 400 });
  }

  try {
    return Response.json(await getUnderwriting(parsedId));
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to load underwriting", error);
    return Response.json({ detail: "Case is temporarily unavailable" }, { status: 502 });
  }
}
