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
          <a
            className="button secondary"
            href="https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks"
          >
            View live proof
          </a>
        </div>
        <div className="proof">
          <span>14-day free trial</span>
          <span>No card required</span>
          <span>GBP 9 / private repo / month</span>
        </div>
      </section>
      <section className="demoProof shell">
        <div>
          <p className="eyebrow">WORKING GITHUB CHECK</p>
          <h2>Proven on a real pull request.</h2>
          <p>
            The demo repository removes the <code>GET /health</code>{" "}
            <code>200</code> response. Contract Guard catches it and fails the
            PR with a precise breaking-change message.
          </p>
        </div>
        <a
          className="proofCard"
          href="https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks"
        >
          <span>API Contract Guard</span>
          <strong>1 breaking API change</strong>
          <small>GET /health - 200 response was removed</small>
        </a>
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
      <section className="distribution shell">
        <p className="eyebrow">READY FOR EARLY USERS</p>
        <h2>Best fit right now</h2>
        <div className="distributionGrid">
          <span>Small SaaS teams with OpenAPI specs</span>
          <span>Platform teams reviewing public API changes</span>
          <span>Agencies maintaining client integrations</span>
          <span>Teams that want PR checks before paid procurement</span>
        </div>
      </section>
      <footer className="shell footer">
        <span>Copyright 2026 API Contract Guard</span>
        <div>
          <a href="https://apicontractguard.com/terms">Terms</a>
          <a href="https://apicontractguard.com/privacy">Privacy</a>
          <a href="https://apicontractguard.com/support">Support</a>
        </div>
      </footer>
    </main>
  );
}
