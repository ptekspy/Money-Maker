import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import {
  getInstallation,
  listRecentChecks,
  listRecentOperationalEvents,
  saveInstallation,
} from "@/lib/data";
import { githubAppSlug } from "@/lib/env";
import { userInstallations } from "@/lib/github";

export const dynamic = "force-dynamic";

const billingMessages = {
  cancelled: "Checkout was cancelled. Protection stays on trial until it ends.",
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

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: Promise<{ billing?: string }>;
}) {
  const session = await currentSession();
  if (!session) redirect("/api/auth/github/start?returnTo=/dashboard");
  const params = await searchParams;
  const billingMessage =
    params?.billing &&
    billingMessages[params.billing as keyof typeof billingMessages];

  const github = await userInstallations(session.accessToken);
  const installations = await Promise.all(
    github.installations.map(async (item) => {
      // Installations created before a webhook was configured will not have a
      // profile yet. Provision it here so the dashboard always reflects the
      // current GitHub App installation instead of remaining in "Connecting".
      await saveInstallation({
        installationId: item.id,
        accountId: item.account.id,
        accountLogin: item.account.login,
        accountType: item.account.type,
        repositorySelection: item.repository_selection,
      });
      const profile = await getInstallation(item.id);
      const checks = profile ? await listRecentChecks(item.id) : [];
      return { item, profile, checks };
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
          <img src={session.avatarUrl} alt="" />
          {session.login}
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
          installations.map(({ item, profile, checks }) => (
            <section className="installation" key={item.id}>
              <div className="installationTop">
                <div>
                  <h2>{item.account.login}</h2>
                  <p>
                    {item.repository_selection === "all"
                      ? "All repositories"
                      : "Selected repositories"}
                  </p>
                </div>
                <div
                  className={`status ${profile?.billingStatus ?? "pending"}`}
                >
                  {profile?.billingStatus === "active"
                    ? "Active"
                    : profile
                      ? `${daysLeft(profile.trialEndsAt)} trial days left`
                      : "Connecting"}
                </div>
              </div>
              {profile &&
              daysLeft(profile.trialEndsAt) === 0 &&
              profile.billingStatus !== "active" ? (
                <form action="/api/billing/checkout" method="post">
                  <input type="hidden" name="installationId" value={item.id} />
                  <button className="button primary" type="submit">
                    Activate protection
                  </button>
                </form>
              ) : null}
              <div className="checks">
                <h3>Recent checks</h3>
                {!checks.length ? (
                  <p className="muted">
                    Open a pull request that changes an OpenAPI file. The first
                    check will appear here and on the GitHub PR.
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
                        {String(check.breakingChanges)} breaking ·{" "}
                        {shortDate(String(check.createdAt ?? ""))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))
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
                    {event.fullName ? `${event.fullName} · ` : ""}
                    {event.detail ?? "No details"} ·{" "}
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
