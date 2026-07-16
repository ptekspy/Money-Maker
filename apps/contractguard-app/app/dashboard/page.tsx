import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import {
  getInstallation,
  listRecentChecks,
  saveInstallation,
} from "@/lib/data";
import { githubAppSlug } from "@/lib/env";
import { userInstallations } from "@/lib/github";

export const dynamic = "force-dynamic";

function daysLeft(trialEndsAt?: string) {
  if (!trialEndsAt) return 0;
  return Math.max(
    0,
    Math.ceil((Date.parse(trialEndsAt) - Date.now()) / 86400000),
  );
}

export default async function Dashboard() {
  const session = await currentSession();
  if (!session) redirect("/api/auth/github/start?returnTo=/dashboard");

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
          </div>
          <a className="button primary" href={installUrl}>
            Add repositories
          </a>
        </header>
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
                    Open a pull request that changes an OpenAPI file to run the
                    first check.
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
                      <span>{String(check.breakingChanges)} breaking</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))
        )}
      </section>
    </main>
  );
}
