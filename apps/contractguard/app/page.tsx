import { ContractChecker } from "@/components/contract-checker";

const appUrl = "https://app.apicontractguard.com";
const demoUrl =
  "https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks";

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="API Contract Guard home">
          <span className="brand-mark">CG</span>
          <span>API Contract Guard</span>
        </a>
        <div className="nav-actions">
          <a className="nav-link" href="#checker">
            Free checker
          </a>
          <a className="nav-link" href={`${appUrl}/api/auth/github/start`}>
            Sign in
          </a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">
          <span /> GitHub checks for OpenAPI teams
        </div>
        <h1>
          Block breaking API changes <em>before merge.</em>
        </h1>
        <p className="hero-copy">
          API Contract Guard installs as a GitHub App, compares OpenAPI specs on
          every pull request, and fails the check when an endpoint, response,
          parameter or schema breaks compatibility.
        </p>
        <div className="hero-actions">
          <a className="button primary" href={`${appUrl}/`}>
            Install the GitHub App
          </a>
          <a className="button secondary" href={demoUrl}>
            View live proof
          </a>
          <span>No card required for the 14-day trial.</span>
        </div>
        <div className="trust-row">
          <span>GitHub App</span>
          <span>OpenAPI JSON & YAML</span>
          <span>PR checks</span>
          <span>Real demo repo</span>
        </div>
      </section>

      <section className="proof-strip shell">
        <article>
          <span>Live proof</span>
          <strong>1 breaking API change</strong>
          <p>GET /health - 200 response was removed.</p>
        </article>
        <article>
          <span>Setup path</span>
          <strong>Install, PR, check</strong>
          <p>A new repository can be protected without a sales call.</p>
        </article>
        <article>
          <span>Pilot offer</span>
          <strong>14 days, no card</strong>
          <p>Stripe can activate billing after the trial.</p>
        </article>
      </section>

      <section className="checker-section" id="checker">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="step">FREE TOOL</span>
              <h2>Compare your contracts</h2>
            </div>
            <p>
              Use a production specification as the baseline and the proposed
              version as the candidate. The automated GitHub App uses the same
              comparison engine.
            </p>
          </div>
          <ContractChecker />
        </div>
      </section>

      <section className="how shell">
        <div className="section-heading">
          <div>
            <span className="step">AUTOPILOT FLOW</span>
            <h2>Built for the pull-request loop</h2>
          </div>
          <p>
            The free checker builds trust. The paid product runs continuously in
            GitHub with no manual review queue.
          </p>
        </div>
        <div className="feature-grid">
          <article>
            <span>1</span>
            <h3>Install</h3>
            <p>
              A GitHub admin grants repository access through the GitHub App
              installation flow.
            </p>
          </article>
          <article>
            <span>2</span>
            <h3>Detect</h3>
            <p>
              Pull request events are queued and compared against the base
              branch OpenAPI contract.
            </p>
          </article>
          <article>
            <span>3</span>
            <h3>Block</h3>
            <p>
              Breaking endpoints, required inputs, removed responses and schema
              changes fail the PR check.
            </p>
          </article>
        </div>
      </section>

      <section className="pricing shell">
        <div className="pricing-card">
          <div>
            <span className="step">AVAILABLE NOW</span>
            <h2>Contract Guard Pro</h2>
            <p>
              Automatic GitHub pull-request checks for OpenAPI repositories.
            </p>
          </div>
          <div className="price">
            <strong>GBP 9</strong>
            <span>/ private repo / month</span>
          </div>
          <a className="button secondary" href={`${appUrl}/`}>
            Start trial
          </a>
        </div>
      </section>

      <footer className="shell footer">
        <span>Copyright 2026 API Contract Guard</span>
        <div>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/support">Support</a>
        </div>
      </footer>
    </main>
  );
}
