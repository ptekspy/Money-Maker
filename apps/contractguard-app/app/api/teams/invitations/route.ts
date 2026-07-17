import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { createWorkspaceInvitation, recordWorkspaceAudit } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { appUrl } from "@/lib/env";
import { canManageMembers, workspaceAccess, workspaceRole } from "@/lib/teams";

export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session)
    return NextResponse.redirect(
      new URL("/api/auth/github/start", request.url),
      303,
    );
  const form = await request.formData();
  const workspaceId = String(form.get("workspaceId") ?? "");
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = workspaceRole(String(form.get("role") ?? "developer"));
  const access = await workspaceAccess(workspaceId, session.userId);
  if (!access || !canManageMembers(access.member.role))
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.redirect(
      new URL(`/teams/${workspaceId}?invite=invalid`, request.url),
      303,
    );

  const { token } = await createWorkspaceInvitation({
    workspaceId,
    email,
    role,
    invitedByUserId: session.userId,
  });
  const inviteUrl = `${appUrl(request.nextUrl.origin)}/teams/invite/${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: `Join ${access.workspace.name} on API Contract Guard`,
    text: `${session.login} invited you to join ${access.workspace.name} as ${role}.\n\nAccept the invitation: ${inviteUrl}\n\nThis invitation expires in 7 days.\n\nAPI Contract Guard`,
  });
  await recordWorkspaceAudit({
    workspaceId,
    actorUserId: session.userId,
    action: "member.invited",
    detail: `${email} (${role})`,
  });
  return NextResponse.redirect(
    new URL(`/teams/${workspaceId}?invite=sent`, request.url),
    303,
  );
}
