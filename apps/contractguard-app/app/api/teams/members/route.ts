import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { removeWorkspaceMember, updateWorkspaceMemberRole } from "@/lib/data";
import {
  canManageMembers,
  syncWorkspaceSeatBilling,
  workspaceAccess,
  workspaceRole,
} from "@/lib/teams";

export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session)
    return NextResponse.redirect(
      new URL("/api/auth/github/start", request.url),
      303,
    );
  const form = await request.formData();
  const workspaceId = String(form.get("workspaceId") ?? "");
  const userId = Number(form.get("userId"));
  const action = String(form.get("action") ?? "");
  const access = await workspaceAccess(workspaceId, session.userId);
  if (!access || !canManageMembers(access.member.role))
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  if (!Number.isSafeInteger(userId))
    return NextResponse.json({ error: "Invalid member" }, { status: 400 });

  if (action === "remove") {
    await removeWorkspaceMember({
      workspaceId,
      userId,
      actorUserId: session.userId,
    });
    await syncWorkspaceSeatBilling(workspaceId);
  } else if (action === "role") {
    await updateWorkspaceMemberRole({
      workspaceId,
      userId,
      role: workspaceRole(String(form.get("role") ?? "developer")),
      actorUserId: session.userId,
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  return NextResponse.redirect(
    new URL(`/teams/${workspaceId}?members=updated`, request.url),
    303,
  );
}
