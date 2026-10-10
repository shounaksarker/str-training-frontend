import { BackendApiError } from "@/lib/api/client";
import { getProperty } from "@/lib/api/properties";

export async function GET(_request: Request, { params }: { params: Promise<{ zpid: string }> }) {
  try {
    const { zpid } = await params;
    return Response.json(await getProperty(zpid));
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to load property", error);
    return Response.json({ detail: "Property is temporarily unavailable" }, { status: 502 });
  }
}
