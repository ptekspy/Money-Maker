import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { getInstallation } from "@/lib/data";
import { appUrl } from "@/lib/env";
import { userInstallations } from "@/lib/github";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { canManageBilling, workspaceAccess } from "@/lib/teams";

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
  const workspaceId = String(form.get("workspaceId") ?? "");
  if (workspaceId) {
    const access = await workspaceAccess(workspaceId, session.userId);
    if (!access || !canManageBilling(access.member.role))
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    if (!access.workspace.stripeCustomerId)
      return NextResponse.redirect(
        new URL(`/teams/${workspaceId}?billing=not-ready`, request.url),
        303,
      );
    const origin = appUrl(request.nextUrl.origin);
    const portal = await stripe().billingPortal.sessions.create({
      customer: access.workspace.stripeCustomerId,
      return_url: `${origin}/teams/${workspaceId}`,
    });
    return NextResponse.redirect(portal.url, 303);
  }
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
  if (installation?.workspaceId) {
    const access = await workspaceAccess(
      installation.workspaceId,
      session.userId,
    );
    if (!access || !canManageBilling(access.member.role))
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (!installation?.stripeCustomerId)
    return NextResponse.redirect(
      new URL("/dashboard?billing=not-ready", request.url),
      303,
    );

  const origin = appUrl(request.nextUrl.origin);
  const portal = await stripe().billingPortal.sessions.create({
    customer: installation.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });
  return NextResponse.redirect(portal.url, 303);
}
