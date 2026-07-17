import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { linkInstallationToWorkspace, updateBilling } from "@/lib/data";
import { userInstallations } from "@/lib/github";
import { canManageMembers, workspaceAccess } from "@/lib/teams";

export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session)
    return NextResponse.redirect(
      new URL("/api/auth/github/start", request.url),
      303,
    );
  const form = await request.formData();
  const workspaceId = String(form.get("workspaceId") ?? "");
  const installationId = Number(form.get("installationId"));
  const access = await workspaceAccess(workspaceId, session.userId);
  if (!access || !canManageMembers(access.member.role))
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  const allowed = (
    await userInstallations(session.accessToken)
  ).installations.some((installation) => installation.id === installationId);
  if (!allowed)
    return NextResponse.json(
      { error: "Installation not available" },
      { status: 403 },
    );

  const linked = await linkInstallationToWorkspace({
    workspaceId,
    installationId,
    actorUserId: session.userId,
  });
  if (!linked)
    return NextResponse.json(
      { error: "Installation belongs to another workspace" },
      { status: 409 },
    );
  if (access.workspace.billingStatus === "active") {
    await updateBilling({
      installationId,
      billingStatus: "active",
      billingPlan: "teams",
      stripeCustomerId: access.workspace.stripeCustomerId,
      stripeSubscriptionId: access.workspace.stripeSubscriptionId,
      planTrialEndsAt: access.workspace.trialEndsAt,
    });
  }
  return NextResponse.redirect(
    new URL(`/teams/${workspaceId}?installation=linked`, request.url),
    303,
  );
}
