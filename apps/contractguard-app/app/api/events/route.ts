import { type NextRequest, NextResponse } from "next/server";
import { type FunnelEventType, recordFunnelEvent } from "@/lib/data";

const allowedOrigins = new Set([
  "https://apicontractguard.com",
  "https://www.apicontractguard.com",
]);
const publicEvents = new Set<FunnelEventType>([
  "checker_run",
  "install_cta_clicked",
]);

function headers(origin: string | null) {
  return {
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin":
      origin && allowedOrigins.has(origin) ? origin : "null",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: headers(request.headers.get("origin")),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403, headers: headers(origin) },
    );
  }
  try {
    const input = JSON.parse(await request.text()) as {
      event?: FunnelEventType;
      source?: string;
      campaign?: string;
    };
    if (!input.event || !publicEvents.has(input.event)) {
      return NextResponse.json(
        { error: "Event not allowed" },
        { status: 400, headers: headers(origin) },
      );
    }
    await recordFunnelEvent({
      type: input.event,
      source: input.source?.slice(0, 80) || "website",
      campaign: input.campaign?.slice(0, 120),
    });
    return NextResponse.json(
      { accepted: true },
      { status: 202, headers: headers(origin) },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid event" },
      { status: 400, headers: headers(origin) },
    );
  }
}
