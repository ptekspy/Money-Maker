import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession, isAdminLogin } from "@/lib/auth";
import {
  type CheckRecord,
  getInstallation,
  listRecentChecks,
  listRecentOperationalEvents,
  listRepositories,
  listUserWorkspaces,
  saveInstallation,
} from "@/lib/data";
import { githubAppSlug } from "@/lib/env";
import { userInstallations } from "@/lib/github";
import { billingPlan, PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

const billingMessages = {
  cancelled: "Checkout was cancelled. Protection stays on trial until it ends.",
  "manage-existing":
    "This installation already has a subscription. Use Manage billing to change it.",
  "not-ready":
    "Stripe billing is not configured yet. Send live keys when you are ready to test activation.",
  success:
    "Checkout completed. Stripe will update protection as soon as the billing webhook arrives.",
} as const;

function daysLeft(trialEndsAt?: string) {
  if (!trialEndsAt) return 0;
  return Math.max(
    0,
    Math.ceil((Date.parse(trialEndsAt) - Date.now()) / 86400000),
  );
}

function shortDate(value?: string) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function journeyMessage(input: {
  checks: CheckRecord[];
  profile: Awaited<ReturnType<typeof getInstallation>>;
}) {
  const { checks, profile } = input;
  if (!profile) {
    return {
      action: "Refresh dashboard",
      message:
        "GitHub reports the installation, but the local profile is still being created.",
      title: "Connecting installation",
    };
  }
  if (profile.billingStatus === "active") {
    const plan = billingPlan(profile.billingPlan);
    const planTrialDays = daysLeft(profile.planTrialEndsAt);
    return {
      action: "Keep shipping",
      message:
        plan === "pro" && planTrialDays > 0
          ? `Your card is verified. Pro billing starts after the remaining ${planTrialDays}-day trial.`
          : `${PLANS[plan].name} protection is active. Pull requests will continue to receive Contract Guard checks.`,
      title:
        plan === "pro" && planTrialDays > 0
          ? "Pro trial active"
          : `${PLANS[plan].name} protection active`,
    };
  }
  if (profile.billingStatus === "past_due") {
    return {
      action: "Update payment",
      message:
        "Stripe has reported a payment issue. Protection should be treated as at risk until billing is fixed.",
      title: "Payment needs attention",
    };
  }
  if (profile.billingStatus === "cancelled" || profile.suspendedAt) {
    return {
      action: "Reactivate",
      message:
        "This installation is cancelled or suspended. Reactivate billing before relying on PR protection.",
      title: "Protection paused",
    };
  }
  if (daysLeft(profile.trialEndsAt) === 0) {
    return {
      action: "Activate protection",
      message:
        "The trial has ended. GitHub checks will ask for activation until billing is connected.",
      title: "Trial ended",
    };
  }
  if (!checks.length) {
    return {
      action: "Open a pull request",
      message:
        "The installation is connected. Change an OpenAPI file on a branch to trigger the first check.",
      title: "Ready for first check",
    };
  }
  if (checks.some((check) => check.conclusion === "failure")) {
    return {
      action: "Review failed PR",
      message:
        "Contract Guard has caught at least one breaking API change on this installation.",
      title: "Breaking change caught",
    };
  }
  return {
    action: "Keep protected",
    message:
      "Checks are running. Passing and neutral checks will appear here as repositories change.",
    title: "Checks are active",
  };
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: Promise<{ billing?: string }>;
}) {
  const session = await currentSession();
  if (!session) redirect("/api/auth/github/start?returnTo=/dashboard");
  const admin = isAdminLogin(session.login);
  const params = await searchParams;
  const billingMessage =
    params?.billing &&
    billingMessages[params.billing as keyof typeof billingMessages];

  const github = await userInstallations(session.accessToken);
  const workspaceMemberships = await listUserWorkspaces(session.userId);
  const installations = await Promise.all(
    github.installations.map(async (item) => {
      await saveInstallation({
        installationId: item.id,
        accountId: item.account.id,
        accountLogin: item.account.login,
        accountType: item.account.type,
        repositorySelection: item.repository_selection,
      });
      const profile = await getInstallation(item.id);
      const [checks, repositories] = profile
        ? await Promise.all([
            listRecentChecks(item.id),
            listRepositories(item.id),
          ])
        : [[], []];
      return { checks, item, profile, repositories };
    }),
  );
  const operationalEvents = await listRecentOperationalEvents(8);
  const totalChecks = installations.reduce(
    (count, installation) => count + installation.checks.length,
    0,
  );
  const failingChecks = installations.reduce(
    (count, installation) =>
      count +
      installation.checks.filter((check) => check.conclusion === "failure")
        .length,
    0,
  );
  const installUrl = `https://github.com/apps/${githubAppSlug()}/installations/new`;

  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/">
          <span className="brandMark">CG</span>API Contract Guard
        </Link>
        <div className="account">
          <Image src={session.avatarUrl} alt="" width={30} height={30} />
          {session.login}
          {admin ? <Link href="/admin">Admin</Link> : null}
          <a href="/api/auth/logout">Sign out</a>
        </div>
      </nav>
      <section className="dashboard shell">
        <header className="dashboardHeader">
          <div>
            <p className="eyebrow">YOUR PROTECTION</p>
            <h1>Repository checks</h1>
            <p className="dashboardIntro">
              Install the GitHub App, open a pull request that changes
              <code> openapi.yaml</code>, and Contract Guard posts a required
              check back into GitHub.
            </p>
          </div>
          <a className="button primary" href={installUrl}>
            Add repositories
          </a>
        </header>
        {billingMessage ? <div className="notice">{billingMessage}</div> : null}
        {workspaceMemberships.length ? (
          <section className="workspaceStrip">
            <div>
              <p className="eyebrow">TEAM WORKSPACES</p>
              <strong>Shared protection and billing</strong>
            </div>
            {workspaceMemberships.map(({ member, workspace }) => (
              <Link
                className="button secondary"
                href={`/teams/${workspace.workspaceId}`}
                key={workspace.workspaceId}
              >
                {workspace.name} · {member.role}
              </Link>
            ))}
          </section>
        ) : null}
        <section className="quickStart">
          <article>
            <span>1</span>
            <h2>Install</h2>
            <p>Grant access to all repositories or only the ones to protect.</p>
          </article>
          <article>
            <span>2</span>
            <h2>Open a PR</h2>
            <p>
              Change an OpenAPI file on a branch and GitHub sends the event.
            </p>
          </article>
          <article>
            <span>3</span>
            <h2>Read the check</h2>
            <p>
              Breaking endpoints, responses and required inputs fail the PR.
            </p>
          </article>
        </section>
        <section className="metricGrid">
          <div>
            <span>Connected installs</span>
            <strong>{installations.length}</strong>
          </div>
          <div>
            <span>Checks recorded</span>
            <strong>{totalChecks}</strong>
          </div>
          <div>
            <span>Breaking checks</span>
            <strong>{failingChecks}</strong>
          </div>
          <a
            href="https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks"
            className="metricLink"
          >
            Live proof PR
          </a>
        </section>
        {!installations.length ? (
          <div className="emptyState">
            <h2>No repositories connected yet</h2>
            <p>Install the GitHub App to start your card-free 14-day trial.</p>
            <a className="button primary" href={installUrl}>
              Install GitHub App
            </a>
          </div>
        ) : (
          installations.map(({ checks, item, profile, repositories }) => {
            const journey = journeyMessage({ checks, profile });
            const plan = billingPlan(profile?.billingPlan);
            const activeRepositories = repositories.filter(
              (repository) => !repository.removed,
            ).length;
            const atStarterLimit =
              plan === "starter" &&
              activeRepositories >= PLANS.starter.repositoryLimit;
            const originalTrialEnded =
              profile && daysLeft(profile.trialEndsAt) === 0;
            const showPlanChoices =
              profile &&
              profile.billingStatus !== "active" &&
              (atStarterLimit || originalTrialEnded);
            return (
              <section className="installation" key={item.id}>
                <div className="installationTop">
                  <div>
                    <h2>{item.account.login}</h2>
                    <p>
                      {item.repository_selection === "all"
                        ? "All repositories"
                        : "Selected repositories"}{" "}
                      ·{" "}
                      {Math.min(
                        activeRepositories,
                        PLANS[plan].repositoryLimit,
                      )}
                      /{PLANS[plan].repositoryLimit} protected
                    </p>
                  </div>
                  <div
                    className={`status ${profile?.billingStatus ?? "pending"}`}
                  >
                    {profile?.billingStatus === "active"
                      ? profile.planTrialEndsAt &&
                        daysLeft(profile.planTrialEndsAt) > 0
                        ? `${PLANS[plan].name} trial · ${daysLeft(profile.planTrialEndsAt)} days`
                        : `${PLANS[plan].name} active`
                      : profile
                        ? `Starter trial · ${daysLeft(profile.trialEndsAt)} days`
                        : "Connecting"}
                  </div>
                </div>
                <div className="journeyCard">
                  <span>{journey.action}</span>
                  <strong>{journey.title}</strong>
                  <p>{journey.message}</p>
                </div>
                {profile &&
                plan === "starter" &&
                profile.billingStatus === "trialing" ? (
                  <div className="planNudge foundingOffer">
                    <span>
                      <strong>Founding offer: first month £1</strong>
                      Then £{PLANS.starter.monthlyPrice}/month. Card required;
                      cancel any time.
                    </span>
                    <form action="/api/billing/checkout" method="post">
                      <input
                        type="hidden"
                        name="installationId"
                        value={item.id}
                      />
                      <input type="hidden" name="plan" value="starter" />
                      <input type="hidden" name="offer" value="founding" />
                      <button className="button primary" type="submit">
                        Claim founding offer
                      </button>
                    </form>
                  </div>
                ) : null}
                {showPlanChoices ? (
                  <section className="planChoices">
                    <article>
                      <span>STARTER</span>
                      <strong>£{PLANS.starter.monthlyPrice}/month</strong>
                      <p>
                        Protect up to {PLANS.starter.repositoryLimit}{" "}
                        repositories. Your current card-free trial is the
                        Starter plan.
                      </p>
                      {originalTrialEnded ? (
                        <form action="/api/billing/checkout" method="post">
                          <input
                            type="hidden"
                            name="installationId"
                            value={item.id}
                          />
                          <input type="hidden" name="plan" value="starter" />
                          <button className="button secondary" type="submit">
                            Continue with Starter
                          </button>
                        </form>
                      ) : (
                        <span className="planCurrent">Current plan</span>
                      )}
                    </article>
                    <article className="recommendedPlan">
                      <span>PRO · RECOMMENDED</span>
                      <strong>£{PLANS.pro.monthlyPrice}/month</strong>
                      <p>
                        Protect up to {PLANS.pro.repositoryLimit} repositories.
                        Enter a card now and get a fresh 14-day trial.
                      </p>
                      <form action="/api/billing/checkout" method="post">
                        <input
                          type="hidden"
                          name="installationId"
                          value={item.id}
                        />
                        <input type="hidden" name="plan" value="pro" />
                        <button className="button primary" type="submit">
                          {profile.proTrialStartedAt
                            ? "Reactivate Pro"
                            : "Start Pro 14-day trial"}
                        </button>
                      </form>
                    </article>
                    <article>
                      <span>TEAMS</span>
                      <strong>£{PLANS.teams.monthlyPrice}/month</strong>
                      <p>
                        Share {PLANS.teams.repositoryLimit} repositories with{" "}
                        {PLANS.teams.includedSeats} users. Additional users are
                        £{PLANS.teams.additionalSeatPrice}/month.
                      </p>
                      <form action="/api/billing/checkout" method="post">
                        <input
                          type="hidden"
                          name="installationId"
                          value={item.id}
                        />
                        <input type="hidden" name="plan" value="teams" />
                        <input
                          type="hidden"
                          name="workspaceName"
                          value={`${item.account.login} team`}
                        />
                        <button className="button secondary" type="submit">
                          Start Teams trial
                        </button>
                      </form>
                    </article>
                  </section>
                ) : null}
                {profile &&
                plan === "starter" &&
                profile.billingStatus === "trialing" &&
                !showPlanChoices ? (
                  <div className="planNudge">
                    <span>
                      Starter protects {PLANS.starter.repositoryLimit} repos.
                      Pro protects {PLANS.pro.repositoryLimit}.
                    </span>
                    <form action="/api/billing/checkout" method="post">
                      <input
                        type="hidden"
                        name="installationId"
                        value={item.id}
                      />
                      <input type="hidden" name="plan" value="pro" />
                      <button className="button secondary" type="submit">
                        Upgrade to Pro · 14 days free
                      </button>
                    </form>
                  </div>
                ) : null}
                {profile?.workspaceId ? (
                  <div className="planNudge">
                    <span>This installation belongs to a Teams workspace.</span>
                    <Link
                      className="button secondary"
                      href={`/teams/${profile.workspaceId}`}
                    >
                      Open team workspace
                    </Link>
                  </div>
                ) : profile && plan !== "teams" && !showPlanChoices ? (
                  <div className="teamUpgrade">
                    <div>
                      <strong>Need shared access?</strong>
                      <span>
                        Teams includes {PLANS.teams.includedSeats} users and{" "}
                        {PLANS.teams.repositoryLimit} repositories for £
                        {PLANS.teams.monthlyPrice}/month.
                      </span>
                    </div>
                    <form action="/api/billing/checkout" method="post">
                      <input
                        type="hidden"
                        name="installationId"
                        value={item.id}
                      />
                      <input type="hidden" name="plan" value="teams" />
                      <input
                        type="hidden"
                        name="workspaceName"
                        value={`${item.account.login} team`}
                      />
                      <button className="button secondary" type="submit">
                        {profile.billingStatus === "active"
                          ? "Convert to Teams · £149/month"
                          : "Start Teams 14-day trial"}
                      </button>
                    </form>
                  </div>
                ) : null}
                {profile?.stripeCustomerId &&
                plan !== "teams" &&
                (profile.billingStatus === "active" ||
                  profile.billingStatus === "past_due") ? (
                  <form action="/api/billing/portal" method="post">
                    <input
                      type="hidden"
                      name="installationId"
                      value={item.id}
                    />
                    <button className="button secondary" type="submit">
                      Manage billing
                    </button>
                  </form>
                ) : null}
                <div className="checks">
                  <h3>Recent checks</h3>
                  {!checks.length ? (
                    <p className="muted">
                      Open a pull request that changes an OpenAPI file. The
                      first check will appear here and on the GitHub PR.
                    </p>
                  ) : (
                    checks.map((check) => (
                      <div className="checkRow" key={String(check.sk)}>
                        <span className={`dot ${String(check.conclusion)}`} />
                        <div>
                          <strong>
                            {String(check.fullName)} #
                            {String(check.pullRequestNumber)}
                          </strong>
                          <small>
                            {String(check.specPath ?? "No contract found")}
                          </small>
                        </div>
                        <span>
                          {String(check.breakingChanges)} breaking -{" "}
                          {shortDate(String(check.createdAt ?? ""))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })
        )}
        <section className="opsPanel">
          <div>
            <p className="eyebrow">OPERATIONS</p>
            <h2>Recent system events</h2>
          </div>
          {!operationalEvents.length ? (
            <p className="muted">No webhook or worker failures recorded.</p>
          ) : (
            operationalEvents.map((event) => (
              <div className="opsRow" key={event.sk}>
                <span className={`dot ${event.severity}`} />
                <div>
                  <strong>{event.message}</strong>
                  <small>
                    {event.fullName ? `${event.fullName} - ` : ""}
                    {event.detail ?? "No details"} -{" "}
                    {shortDate(event.createdAt)}
                  </small>
                </div>
              </div>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
