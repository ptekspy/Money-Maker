import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession, isAdminLogin } from "@/lib/auth";
import {
  listRecentChecks,
  listRepositories,
  listWorkspaceAudit,
  listWorkspaceInstallations,
  listWorkspaceMembers,
  saveInstallation,
} from "@/lib/data";
import { githubAppSlug } from "@/lib/env";
import { userInstallations } from "@/lib/github";
import { PLANS } from "@/lib/plans";
import {
  canManageBilling,
  canManageMembers,
  TEAM_ROLES,
  workspaceAccess,
} from "@/lib/teams";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  cancelled: "Teams Checkout was cancelled. No card was saved.",
  converted: "The existing subscription is being converted to Teams.",
  success:
    "Teams Checkout completed. Stripe is activating the shared workspace.",
};

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function daysLeft(value?: string) {
  if (!value) return 0;
  return Math.max(0, Math.ceil((Date.parse(value) - Date.now()) / 86400000));
}

export default async function TeamWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams?: Promise<Record<string, string>>;
}) {
  const session = await currentSession();
  const { workspaceId } = await params;
  if (!session)
    redirect(
      `/api/auth/github/start?returnTo=${encodeURIComponent(`/teams/${workspaceId}`)}`,
    );
  const access = await workspaceAccess(workspaceId, session.userId);
  if (!access) redirect("/dashboard?teams=not-authorized");
  const query = await searchParams;
  const [members, installations, audits, github] = await Promise.all([
    listWorkspaceMembers(workspaceId),
    listWorkspaceInstallations(workspaceId),
    listWorkspaceAudit(workspaceId),
    userInstallations(session.accessToken),
  ]);
  const connectedIds = new Set(
    installations.map((installation) => installation.installationId),
  );
  await Promise.all(
    github.installations.map((installation) =>
      saveInstallation({
        installationId: installation.id,
        accountId: installation.account.id,
        accountLogin: installation.account.login,
        accountType: installation.account.type,
        repositorySelection: installation.repository_selection,
      }),
    ),
  );
  const availableInstallations = github.installations.filter(
    (installation) => !connectedIds.has(installation.id),
  );
  const installationData = await Promise.all(
    installations.map(async (installation) => {
      const [repositories, checks] = await Promise.all([
        listRepositories(installation.installationId),
        listRecentChecks(installation.installationId),
      ]);
      return {
        installation,
        repositories: repositories.filter((repository) => !repository.removed),
        checks,
      };
    }),
  );
  const repositoryCount = installationData.reduce(
    (total, item) => total + item.repositories.length,
    0,
  );
  const extraSeats = Math.max(0, members.length - PLANS.teams.includedSeats);
  const memberManager = canManageMembers(access.member.role);
  const billingManager = canManageBilling(access.member.role);
  const firstInstallation = installations[0];
  const billingMessage = query?.billing ? messages[query.billing] : undefined;

  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/dashboard">
          <span className="brandMark">CG</span>API Contract Guard
        </Link>
        <div className="account">
          <Image src={session.avatarUrl} alt="" width={30} height={30} />
          {session.login}
          <Link href="/dashboard">Personal</Link>
          {isAdminLogin(session.login) ? (
            <Link href="/admin">Admin</Link>
          ) : null}
          <a href="/api/auth/logout">Sign out</a>
        </div>
      </nav>
      <section className="dashboard shell">
        <header className="dashboardHeader">
          <div>
            <p className="eyebrow">TEAM WORKSPACE</p>
            <h1>{access.workspace.name}</h1>
            <p className="dashboardIntro">
              Shared protection, membership and billing across every connected
              GitHub installation.
            </p>
          </div>
          <span className={`status ${access.workspace.billingStatus}`}>
            {access.workspace.billingStatus === "active" &&
            daysLeft(access.workspace.trialEndsAt) > 0
              ? `Teams trial · ${daysLeft(access.workspace.trialEndsAt)} days`
              : `Teams ${access.workspace.billingStatus}`}
          </span>
        </header>
        {billingMessage ? <div className="notice">{billingMessage}</div> : null}
        {query?.invite === "sent" ? (
          <div className="notice">Invitation sent successfully.</div>
        ) : null}
        {query?.joined ? (
          <div className="notice">Welcome to the workspace.</div>
        ) : null}
        <section className="metricGrid teamMetrics">
          <div>
            <span>Members</span>
            <strong>
              {members.length}/{PLANS.teams.includedSeats}
            </strong>
          </div>
          <div>
            <span>Repositories</span>
            <strong>
              {repositoryCount}/{PLANS.teams.repositoryLimit}
            </strong>
          </div>
          <div>
            <span>GitHub installs</span>
            <strong>{installations.length}</strong>
          </div>
          <div>
            <span>Monthly price</span>
            <strong>
              £
              {PLANS.teams.monthlyPrice +
                extraSeats * PLANS.teams.additionalSeatPrice}
            </strong>
          </div>
        </section>

        {access.workspace.billingStatus !== "active" && firstInstallation ? (
          <section className="teamBillingCard">
            <div>
              <p className="eyebrow">ACTIVATE TEAMS</p>
              <h2>£{PLANS.teams.monthlyPrice}/month · 14 days free</h2>
              <p>
                Includes {PLANS.teams.includedSeats} users and{" "}
                {PLANS.teams.repositoryLimit} repositories. Additional users are
                £{PLANS.teams.additionalSeatPrice}/month.
              </p>
            </div>
            {billingManager ? (
              <form action="/api/billing/checkout" method="post">
                <input
                  type="hidden"
                  name="installationId"
                  value={firstInstallation.installationId}
                />
                <input type="hidden" name="plan" value="teams" />
                <input
                  type="hidden"
                  name="workspaceName"
                  value={access.workspace.name}
                />
                <button className="button primary" type="submit">
                  Activate Teams
                </button>
              </form>
            ) : null}
          </section>
        ) : billingManager && access.workspace.stripeCustomerId ? (
          <form action="/api/billing/portal" method="post">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <button className="button secondary" type="submit">
              Manage team billing
            </button>
          </form>
        ) : null}

        <section className="teamGrid">
          <article className="teamPanel">
            <div className="panelHeading">
              <div>
                <p className="eyebrow">MEMBERS</p>
                <h2>People and roles</h2>
              </div>
              <span>{extraSeats} paid extra seats</span>
            </div>
            {members.map((member) => (
              <div className="memberRow" key={member.userId}>
                <div>
                  <strong>{member.login}</strong>
                  <small>{member.email || "GitHub member"}</small>
                </div>
                {member.role === "owner" || !memberManager ? (
                  <span className="roleBadge">{member.role}</span>
                ) : (
                  <div className="memberActions">
                    <form action="/api/teams/members" method="post">
                      <input
                        type="hidden"
                        name="workspaceId"
                        value={workspaceId}
                      />
                      <input
                        type="hidden"
                        name="userId"
                        value={member.userId}
                      />
                      <input type="hidden" name="action" value="role" />
                      <select name="role" defaultValue={member.role}>
                        {TEAM_ROLES.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <button className="button secondary small" type="submit">
                        Save
                      </button>
                    </form>
                    <form action="/api/teams/members" method="post">
                      <input
                        type="hidden"
                        name="workspaceId"
                        value={workspaceId}
                      />
                      <input
                        type="hidden"
                        name="userId"
                        value={member.userId}
                      />
                      <input type="hidden" name="action" value="remove" />
                      <button className="button danger small" type="submit">
                        Remove
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
            {memberManager ? (
              <form
                className="inviteForm"
                action="/api/teams/invitations"
                method="post"
              >
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <label>
                  Invite by email
                  <input
                    name="email"
                    type="email"
                    placeholder="developer@company.com"
                    required
                  />
                </label>
                <label>
                  Role
                  <select name="role" defaultValue="developer">
                    {TEAM_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button primary" type="submit">
                  Send invitation
                </button>
              </form>
            ) : null}
          </article>

          <article className="teamPanel">
            <div className="panelHeading">
              <div>
                <p className="eyebrow">GITHUB</p>
                <h2>Connected installations</h2>
              </div>
              <a
                href={`https://github.com/apps/${githubAppSlug()}/installations/new`}
              >
                Install app
              </a>
            </div>
            {installations.map((installation) => (
              <div
                className="workspaceInstall"
                key={installation.installationId}
              >
                <strong>{installation.accountLogin}</strong>
                <span>installation {installation.installationId}</span>
              </div>
            ))}
            {memberManager && availableInstallations.length ? (
              <form
                className="attachForm"
                action="/api/teams/installations"
                method="post"
              >
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <select name="installationId" required>
                  {availableInstallations.map((installation) => (
                    <option key={installation.id} value={installation.id}>
                      {installation.account.login}
                    </option>
                  ))}
                </select>
                <button className="button secondary" type="submit">
                  Add to workspace
                </button>
              </form>
            ) : null}
          </article>
        </section>

        <section className="teamPanel teamChecks">
          <p className="eyebrow">SHARED CHECKS</p>
          <h2>Repositories across the workspace</h2>
          {installationData.flatMap((item) =>
            item.checks.slice(0, 5).map((check) => (
              <div className="checkRow" key={check.sk}>
                <span className={`dot ${check.conclusion}`} />
                <div>
                  <strong>
                    {check.fullName} #{check.pullRequestNumber}
                  </strong>
                  <small>{check.specPath || "No contract found"}</small>
                </div>
                <span>{check.breakingChanges} breaking</span>
              </div>
            )),
          )}
          {!installationData.some((item) => item.checks.length) ? (
            <p className="muted">No workspace checks have run yet.</p>
          ) : null}
        </section>

        <section className="teamPanel">
          <p className="eyebrow">AUDIT HISTORY</p>
          <h2>Workspace activity</h2>
          {audits.map((event) => (
            <div className="auditRow" key={event.sk}>
              <strong>{event.action}</strong>
              <span>{event.detail || "No details"}</span>
              <time>{shortDate(event.createdAt)}</time>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
