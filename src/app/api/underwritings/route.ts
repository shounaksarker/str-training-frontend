import { BackendApiError } from "@/lib/api/client";
import { startUnderwriting } from "@/lib/api/underwritings";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ detail: "Enter a valid property ID" }, { status: 400 });
  }

  const zpid = typeof payload === "object" && payload !== null && "zpid" in payload
    ? payload.zpid
    : null;
  if (typeof zpid !== "string" || !zpid.trim()) {
    return Response.json({ detail: "Enter a valid property ID" }, { status: 400 });
  }

  try {
    return Response.json(await startUnderwriting(zpid), { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to start underwriting", error);
    return Response.json({ detail: "Could not start this case. Please try again." }, { status: 502 });
  }
}
