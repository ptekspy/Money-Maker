import { NextResponse } from "next/server";
import { listRecentOperationalEvents } from "@/lib/data";
import { env } from "@/lib/env";
import { stripeConfig } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  try {
    const recentEvents = await listRecentOperationalEvents(1);
    return NextResponse.json({
      ok: true,
      appUrl: env("CONTRACTGUARD_APP_URL"),
      githubAppConfigured: Boolean(env("CONTRACTGUARD_GITHUB_APP_ID")),
      webhookSecretConfigured: Boolean(
        env("CONTRACTGUARD_GITHUB_WEBHOOK_SECRET"),
      ),
      stripe: stripeConfig(),
      recentOperationalEvents: recentEvents.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 },
    );
  }
}
