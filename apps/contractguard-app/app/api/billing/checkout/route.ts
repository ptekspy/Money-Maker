import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { getInstallation, recordFunnelEvent } from "@/lib/data";
import { appUrl, requiredEnv } from "@/lib/env";
import { installationRepositories, userInstallations } from "@/lib/github";
import { stripe, stripeConfigured } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session)
    return NextResponse.redirect(
      new URL("/api/auth/github/start", request.url),
      303,
    );
  if (!stripeConfigured())
    return NextResponse.redirect(
      new URL("/dashboard?billing=not-ready", request.url),
      303,
    );

  const form = await request.formData();
  const installationId = Number(form.get("installationId"));
  const allowed = (
    await userInstallations(session.accessToken)
  ).installations.some((installation) => installation.id === installationId);
  if (!allowed)
    return NextResponse.json(
      { error: "Installation not available" },
      { status: 403 },
    );
  const installation = await getInstallation(installationId);
  const repositories = await installationRepositories(installationId);
  const quantity = Math.max(
    1,
    repositories.repositories.filter((repo) => repo.private).length,
  );
  const origin = appUrl(request.nextUrl.origin);
  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: undefined,
    client_reference_id: String(installationId),
    billing_address_collection: "auto",
    line_items: [
      { price: requiredEnv("STRIPE_CONTRACTGUARD_PRICE_ID"), quantity },
    ],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?billing=success`,
    cancel_url: `${origin}/dashboard?billing=cancelled`,
    subscription_data: { metadata: { installationId: String(installationId) } },
    metadata: {
      installationId: String(installationId),
      githubLogin: session.login,
      accountLogin: installation?.accountLogin ?? "",
      privateRepositories: String(quantity),
    },
  });
  await recordFunnelEvent({
    type: "checkout_started",
    userId: session.userId,
    login: session.login,
    installationId,
    dedupeId: `checkout-${checkout.id}`,
  });
  return NextResponse.redirect(checkout.url ?? `${origin}/dashboard`, 303);
}
