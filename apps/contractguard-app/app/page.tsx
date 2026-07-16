import Link from "next/link";
import { currentSession } from "@/lib/auth";
import { githubAppSlug } from "@/lib/env";

export default async function Home() {
  const session = await currentSession();
  const installUrl = `https://github.com/apps/${githubAppSlug()}/installations/new`;
  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/">
          <span className="brandMark">CG</span>
          API Contract Guard
        </Link>
        <Link
          className="textLink"
          href={session ? "/dashboard" : "/api/auth/github/start"}
        >
          {session ? "Dashboard" : "Sign in"}
        </Link>
      </nav>
      <section className="hero shell">
        <p className="eyebrow">AUTOMATED PULL-REQUEST PROTECTION</p>
        <h1>
          Stop breaking your API <em>before merge.</em>
        </h1>
        <p className="lede">
          Install once. Every pull request is checked against the base branch,
          with breaking OpenAPI changes reported directly in GitHub.
        </p>
        <div className="actions">
          <a className="button primary" href={installUrl}>
            Install GitHub App
          </a>
          <a className="button secondary" href="https://apicontractguard.com">
            Try the free checker
          </a>
        </div>
        <div className="proof">
          <span>14-day free trial</span>
          <span>No card required</span>
          <span>£9 / private repo / month</span>
        </div>
      </section>
      <section className="steps shell">
        <article>
          <b>01</b>
          <h2>Select repositories</h2>
          <p>Grant access only to the repositories you want protected.</p>
        </article>
        <article>
          <b>02</b>
          <h2>Open a pull request</h2>
          <p>The base and proposed OpenAPI files are compared automatically.</p>
        </article>
        <article>
          <b>03</b>
          <h2>Merge with confidence</h2>
          <p>
            Breaking endpoints, parameters, responses and schemas block the
            check.
          </p>
        </article>
      </section>
    </main>
  );
}
