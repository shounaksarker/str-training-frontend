import { BackendApiError } from "@/lib/api/client";
import { getUnderwriting, saveUnderwriting } from "@/lib/api/underwritings";
import type { SaveUnderwritingPayload } from "@/lib/api/types";

async function getId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const parsedId = Number(id);
  return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsedId = await getId(params);
  if (parsedId === null) {
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsedId = await getId(params);
  if (parsedId === null) {
    return Response.json({ detail: "Invalid case ID" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ detail: "Invalid form data" }, { status: 400 });
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return Response.json({ detail: "Invalid form data" }, { status: 400 });
  }

  try {
    return Response.json(await saveUnderwriting(parsedId, payload as SaveUnderwritingPayload));
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to save underwriting", error);
    return Response.json({ detail: "Could not save this draft. Please try again." }, { status: 502 });
  }
}
