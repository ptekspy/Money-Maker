import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession, isAdminLogin } from "@/lib/auth";
import {
  type BillingStatus,
  type CheckRecord,
  type Installation,
  listAllInstallations,
  listFunnelEventsSince,
  listRecentChecks,
  listRecentOperationalEvents,
  listRepositories,
} from "@/lib/data";
import { stripeConfig } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function daysLeft(trialEndsAt?: string) {
  if (!trialEndsAt) return 0;
  return Math.max(
    0,
    Math.ceil((Date.parse(trialEndsAt) - Date.now()) / 86400000),
  );
}

function shortDate(value?: string) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function statusCounts(installations: Installation[]) {
  return installations.reduce<Record<BillingStatus, number>>(
    (counts, installation) => {
      counts[installation.billingStatus] += 1;
      return counts;
    },
    { active: 0, cancelled: 0, past_due: 0, trialing: 0 },
  );
}

function checkCounts(checks: CheckRecord[]) {
  return checks.reduce(
    (counts, check) => {
      if (check.conclusion === "failure") counts.breaking += 1;
      if (check.conclusion === "success") counts.passing += 1;
      if (check.conclusion === "neutral") counts.neutral += 1;
      if (check.conclusion === "action_required") counts.actionRequired += 1;
      return counts;
    },
    { actionRequired: 0, breaking: 0, neutral: 0, passing: 0 },
  );
}

export default async function AdminPage() {
  const session = await currentSession();
  if (!session) redirect("/api/auth/github/start?returnTo=/admin");
  if (!isAdminLogin(session.login)) redirect("/dashboard");

  const installations = (await listAllInstallations()).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  const rows = await Promise.all(
    installations.map(async (installation) => {
      const [repositories, checks] = await Promise.all([
        listRepositories(installation.installationId),
        listRecentChecks(installation.installationId),
      ]);
      return { checks, installation, repositories };
    }),
  );
  const allChecks = rows.flatMap((row) => row.checks);
  const allRepositories = rows.flatMap((row) => row.repositories);
  const ops = await listRecentOperationalEvents(20);
  const billing = statusCounts(installations);
  const checks = checkCounts(allChecks);
  const stripe = stripeConfig();
  const funnelEvents = await listFunnelEventsSince(
    new Date(Date.now() - 7 * 86400000),
  );
  const funnel = Object.fromEntries(
    [
      "checker_run",
      "install_cta_clicked",
      "github_sign_in",
      "installation_created",
      "check_completed",
      "checkout_started",
      "subscription_activated",
    ].map((type) => [
      type,
      funnelEvents.filter((event) => event.type === type).length,
    ]),
  );

  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/dashboard">
          <span className="brandMark">CG</span>API Contract Guard
        </Link>
        <div className="account">
          <span>Admin</span>
          <a href="/dashboard">Customer view</a>
          <a href="/api/auth/logout">Sign out</a>
        </div>
      </nav>
      <section className="dashboard shell">
        <header className="dashboardHeader">
          <div>
            <p className="eyebrow">OPERATOR VIEW</p>
            <h1>Admin dashboard</h1>
            <p className="dashboardIntro">
              Watch installs, billing, usage, and operational errors from one
              place.
            </p>
          </div>
        </header>

        <section className="metricGrid adminMetrics">
          <div>
            <span>Installs</span>
            <strong>{installations.length}</strong>
          </div>
          <div>
            <span>Repositories</span>
            <strong>
              {allRepositories.filter((repo) => !repo.removed).length}
            </strong>
          </div>
          <div>
            <span>Checks</span>
            <strong>{allChecks.length}</strong>
          </div>
          <div>
            <span>Ops errors</span>
            <strong>
              {ops.filter((event) => event.severity === "error").length}
            </strong>
          </div>
        </section>

        <section className="opsPanel">
          <div>
            <p className="eyebrow">LAST 7 DAYS</p>
            <h2>Acquisition funnel</h2>
          </div>
          <div className="metricGrid adminMetrics">
            <div>
              <span>Checker runs</span>
              <strong>{funnel.checker_run}</strong>
            </div>
            <div>
              <span>CTA clicks</span>
              <strong>{funnel.install_cta_clicked}</strong>
            </div>
            <div>
              <span>GitHub sign-ins</span>
              <strong>{funnel.github_sign_in}</strong>
            </div>
            <div>
              <span>Installs</span>
              <strong>{funnel.installation_created}</strong>
            </div>
            <div>
              <span>Checks run</span>
              <strong>{funnel.check_completed}</strong>
            </div>
            <div>
              <span>Checkouts</span>
              <strong>{funnel.checkout_started}</strong>
            </div>
            <div>
              <span>Paid</span>
              <strong>{funnel.subscription_activated}</strong>
            </div>
          </div>
          <p className="muted">
            A summary is emailed to admin@apicontractguard.com every Monday at
            08:00 Europe/London.
          </p>
        </section>

        <section className="adminGrid">
          <article className="adminPanel">
            <h2>Billing states</h2>
            <div className="stateList">
              <span>
                Trialing <strong>{billing.trialing}</strong>
              </span>
              <span>
                Active <strong>{billing.active}</strong>
              </span>
              <span>
                Past due <strong>{billing.past_due}</strong>
              </span>
              <span>
                Cancelled <strong>{billing.cancelled}</strong>
              </span>
            </div>
          </article>
          <article className="adminPanel">
            <h2>Check outcomes</h2>
            <div className="stateList">
              <span>
                Passing <strong>{checks.passing}</strong>
              </span>
              <span>
                Breaking <strong>{checks.breaking}</strong>
              </span>
              <span>
                Neutral <strong>{checks.neutral}</strong>
              </span>
              <span>
                Action required <strong>{checks.actionRequired}</strong>
              </span>
            </div>
          </article>
          <article className="adminPanel">
            <h2>Stripe readiness</h2>
            <div className="stateList">
              <span>
                Secret key <strong>{stripe.secretKey ? "yes" : "no"}</strong>
              </span>
              <span>
                Webhook secret{" "}
                <strong>{stripe.webhookSecret ? "yes" : "no"}</strong>
              </span>
              <span>
                Price ID <strong>{stripe.priceId ? "yes" : "no"}</strong>
              </span>
            </div>
          </article>
        </section>

        <section className="opsPanel">
          <div>
            <p className="eyebrow">INSTALLATIONS</p>
            <h2>Accounts and repositories</h2>
          </div>
          {!rows.length ? (
            <p className="muted">No installations recorded yet.</p>
          ) : (
            rows.map(({ checks: recentChecks, installation, repositories }) => (
              <div className="adminInstall" key={installation.installationId}>
                <div>
                  <strong>{installation.accountLogin}</strong>
                  <small>
                    install {installation.installationId} -{" "}
                    {installation.repositorySelection} -{" "}
                    {installation.billingStatus} -{" "}
                    {daysLeft(installation.trialEndsAt)} trial days left
                  </small>
                  <small>
                    Stripe customer {installation.stripeCustomerId || "none"} -
                    subscription {installation.stripeSubscriptionId || "none"}
                  </small>
                </div>
                <div className="adminInstallMeta">
                  <span>
                    {repositories.filter((repo) => !repo.removed).length} repos
                  </span>
                  <span>{recentChecks.length} checks</span>
                  <span>
                    {
                      recentChecks.filter(
                        (check) => check.conclusion === "failure",
                      ).length
                    }{" "}
                    breaking
                  </span>
                </div>
                {recentChecks[0] ? (
                  <p className="muted">
                    Latest: {recentChecks[0].fullName} #
                    {recentChecks[0].pullRequestNumber} -{" "}
                    {recentChecks[0].conclusion} -{" "}
                    {shortDate(recentChecks[0].createdAt)}
                  </p>
                ) : (
                  <p className="muted">No checks yet.</p>
                )}
              </div>
            ))
          )}
        </section>

        <section className="opsPanel">
          <div>
            <p className="eyebrow">RISK QUEUE</p>
            <h2>Recent system events</h2>
          </div>
          {!ops.length ? (
            <p className="muted">No operational events recorded.</p>
          ) : (
            ops.map((event) => (
              <div className="opsRow" key={event.sk}>
                <span className={`dot ${event.severity}`} />
                <div>
                  <strong>
                    {event.source}: {event.message}
                  </strong>
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
