import { BackendApiError } from "@/lib/api/client";
import { getMarket } from "@/lib/api/markets";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isSafeInteger(parsedId) || parsedId < 1) {
    return Response.json({ detail: "Invalid market ID" }, { status: 400 });
  }

  try {
    return Response.json(await getMarket(parsedId));
  } catch (error) {
    if (error instanceof BackendApiError && error.status < 500) {
      return Response.json({ detail: error.message }, { status: error.status });
    }
    console.error("Unable to load market", error);
    return Response.json({ detail: "Market is temporarily unavailable" }, { status: 502 });
  }
}
