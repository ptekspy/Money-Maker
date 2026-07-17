import { ContractChecker } from "@/components/contract-checker";
import { TrackedLink } from "@/components/tracked-link";

const appUrl = "https://app.apicontractguard.com";
const demoUrl =
  "https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks";
const authUrl = `${appUrl}/api/auth/github/start?source=website`;

export default function Home() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "API Contract Guard",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web, GitHub",
    description:
      "Automated GitHub pull-request checks that detect breaking OpenAPI changes before merge.",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "19",
        priceCurrency: "GBP",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "49",
        priceCurrency: "GBP",
      },
      {
        "@type": "Offer",
        name: "Teams",
        price: "149",
        priceCurrency: "GBP",
      },
    ],
  };

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
          <TrackedLink
            className="nav-link"
            href={`${authUrl}&campaign=nav_signin`}
            event="install_cta_clicked"
            campaign="nav_signin"
          >
            Sign in
          </TrackedLink>
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
          <TrackedLink
            className="button primary"
            href={`${authUrl}&campaign=homepage_install`}
            event="install_cta_clicked"
            campaign="homepage_install"
          >
            Get the first month for £1
          </TrackedLink>
          <a className="button secondary" href={demoUrl}>
            View live proof
          </a>
          <span>Founding Starter offer: £1 now, then £19/month.</span>
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
          <span>Founding offer</span>
          <strong>First month for £1</strong>
          <p>Then £19/month. Cancel any time from the billing portal.</p>
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
        <span className="step">AVAILABLE NOW</span>
        <h2>Simple plans that grow with the repositories you protect</h2>
        <div className="pricing-grid">
          <article className="pricing-card">
            <div>
              <h3>Starter</h3>
              <p>Automatic checks for up to 3 repositories.</p>
            </div>
            <div className="price">
              <strong>GBP 1</strong>
              <span>first month, then GBP 19/month</span>
            </div>
            <TrackedLink
              className="button secondary"
              href={`${authUrl}&campaign=pricing_starter`}
              event="install_cta_clicked"
              campaign="pricing_starter"
            >
              Claim founding offer
            </TrackedLink>
          </article>
          <article className="pricing-card recommended">
            <div>
              <span className="step">RECOMMENDED</span>
              <h3>Pro</h3>
              <p>Protect up to 20 repositories with a fresh 14-day trial.</p>
            </div>
            <div className="price">
              <strong>GBP 49</strong>
              <span>/ month</span>
            </div>
            <TrackedLink
              className="button secondary"
              href={`${authUrl}&campaign=pricing_pro`}
              event="install_cta_clicked"
              campaign="pricing_pro"
            >
              Start free trial
            </TrackedLink>
          </article>
          <article className="pricing-card">
            <div>
              <h3>Teams</h3>
              <p>
                5 users, 50 repositories, shared billing and role-based access.
                Additional users cost GBP 15/month.
              </p>
            </div>
            <div className="price">
              <strong>GBP 149</strong>
              <span>/ month</span>
            </div>
            <TrackedLink
              className="button secondary"
              href={`${authUrl}&campaign=pricing_teams`}
              event="install_cta_clicked"
              campaign="pricing_teams"
            >
              Start Teams trial
            </TrackedLink>
          </article>
        </div>
      </section>

      <section className="resources shell">
        <span className="step">OPENAPI GUIDES</span>
        <h2>Protect the contract, not just the code</h2>
        <div>
          <a href="/openapi-breaking-change-detection">
            OpenAPI breaking change detection
          </a>
          <a href="/openapi-diff-github-actions">
            OpenAPI diff for GitHub pull requests
          </a>
          <a href="/openapi-diff-tool">OpenAPI diff tool</a>
          <a href="/openapi-ci-check">OpenAPI CI check</a>
          <a href="/stop-breaking-api-changes">Stop breaking API changes</a>
          <a href="/api-contract-testing">API contract testing</a>
          <a href="/openapi-backward-compatibility">
            OpenAPI backward compatibility
          </a>
          <a href="/guides">All OpenAPI guides</a>
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
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </main>
  );
}
