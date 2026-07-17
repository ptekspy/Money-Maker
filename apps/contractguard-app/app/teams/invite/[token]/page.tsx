import Link from "next/link";
import { currentSession } from "@/lib/auth";
import {
  getUserProfile,
  getWorkspace,
  getWorkspaceInvitation,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TeamInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const invitation = await getWorkspaceInvitation(token);
  const workspace = invitation
    ? await getWorkspace(invitation.workspaceId)
    : null;
  const session = await currentSession();
  const user = session ? await getUserProfile(session.userId) : null;
  const email = session?.email || user?.email;
  const expired =
    !invitation ||
    Boolean(invitation.acceptedAt) ||
    invitation.expiresAt <= Math.floor(Date.now() / 1000);
  const matches =
    invitation && email
      ? invitation.email === email.trim().toLowerCase()
      : false;
  const returnTo = `/teams/invite/${encodeURIComponent(token)}`;

  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/">
          <span className="brandMark">CG</span>API Contract Guard
        </Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
      <section className="inviteShell shell">
        <p className="eyebrow">TEAM INVITATION</p>
        <h1>
          {workspace ? `Join ${workspace.name}` : "Invitation unavailable"}
        </h1>
        {expired ? (
          <div className="notice">
            This invitation has expired, has already been accepted, or is no
            longer available. Ask a workspace administrator for a new one.
          </div>
        ) : (
          <>
            <p>
              You have been invited as <strong>{invitation.role}</strong> using{" "}
              <strong>{invitation.email}</strong>.
            </p>
            {!session ? (
              <a
                className="button primary"
                href={`/api/auth/github/start?returnTo=${encodeURIComponent(returnTo)}`}
              >
                Sign in with GitHub to accept
              </a>
            ) : matches ? (
              <form
                action={`/api/teams/invitations/${encodeURIComponent(token)}/accept`}
                method="post"
              >
                <button className="button primary" type="submit">
                  Accept invitation
                </button>
              </form>
            ) : (
              <div className="notice">
                Sign in with the GitHub account whose verified email is{" "}
                {invitation.email}. Your current account uses{" "}
                {email || "no verified email"}.
              </div>
            )}
          </>
        )}
        {query?.error ? (
          <p className="muted">
            The invitation could not be accepted. Check the email account and
            try again.
          </p>
        ) : null}
      </section>
    </main>
  );
}
