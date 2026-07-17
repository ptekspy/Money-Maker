import { type NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { acceptWorkspaceInvitation, getUserProfile } from "@/lib/data";
import { syncWorkspaceSeatBilling } from "@/lib/teams";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const returnTo = `/teams/invite/${encodeURIComponent(token)}`;
  const session = await currentSession();
  if (!session)
    return NextResponse.redirect(
      new URL(
        `/api/auth/github/start?returnTo=${encodeURIComponent(returnTo)}`,
        request.url,
      ),
      303,
    );
  const user = await getUserProfile(session.userId);
  const email = session.email || user?.email;
  if (!email)
    return NextResponse.redirect(
      new URL(`${returnTo}?error=email`, request.url),
      303,
    );
  const invitation = await acceptWorkspaceInvitation({
    token,
    userId: session.userId,
    login: session.login,
    email,
  });
  if (!invitation)
    return NextResponse.redirect(
      new URL(`${returnTo}?error=invalid`, request.url),
      303,
    );
  await syncWorkspaceSeatBilling(invitation.workspaceId);
  return NextResponse.redirect(
    new URL(`/teams/${invitation.workspaceId}?joined=true`, request.url),
    303,
  );
}
