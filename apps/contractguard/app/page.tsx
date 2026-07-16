import { ContractChecker } from "@/components/contract-checker";

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="API Contract Guard home">
          <span className="brand-mark">CG</span>
          <span>API Contract Guard</span>
        </a>
        <a className="nav-link" href="#checker">
          Run a free check
        </a>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">
          <span /> OpenAPI 3.x contract checks
        </div>
        <h1>
          Catch breaking API changes <em>before your customers do.</em>
        </h1>
        <p className="hero-copy">
          Compare two OpenAPI specifications in your browser. Get a clear,
          downloadable report of removed endpoints, new required inputs and
          incompatible schemas.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#checker">
            Check my API — free
          </a>
          <span>No account. No upload. Your specs stay in your browser.</span>
        </div>
        <div className="trust-row">
          <span>✓ JSON & YAML</span>
          <span>✓ Runs locally</span>
          <span>✓ Downloadable report</span>
          <span>✓ No signup</span>
        </div>
      </section>

      <section className="checker-section" id="checker">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="step">01</span>
              <h2>Compare your contracts</h2>
            </div>
            <p>
              Use a production specification as the baseline and the proposed
              version as the candidate.
            </p>
          </div>
          <ContractChecker />
        </div>
      </section>

      <section className="how shell">
        <div className="section-heading">
          <div>
            <span className="step">02</span>
            <h2>Built for the pull-request loop</h2>
          </div>
          <p>
            The web checker is free. Automated repository checks are the paid
            product.
          </p>
        </div>
        <div className="feature-grid">
          <article>
            <span>1</span>
            <h3>Compare</h3>
            <p>
              Parse OpenAPI JSON or YAML and map endpoints, parameters, request
              bodies, responses and schemas.
            </p>
          </article>
          <article>
            <span>2</span>
            <h3>Explain</h3>
            <p>
              Turn a noisy structural diff into a prioritised list your team can
              act on immediately.
            </p>
          </article>
          <article>
            <span>3</span>
            <h3>Block</h3>
            <p>
              Pro will run on every pull request and fail the check when a
              breaking change is introduced.
            </p>
          </article>
        </div>
      </section>

      <section className="pricing shell">
        <div className="pricing-card">
          <div>
            <span className="step">COMING NEXT</span>
            <h2>Contract Guard Pro</h2>
            <p>
              Automatic GitHub pull-request checks for private repositories.
            </p>
          </div>
          <div className="price">
            <strong>£9</strong>
            <span>/ repository / month</span>
          </div>
          <a
            className="button secondary"
            href="mailto:hello@apicontractguard.com?subject=Contract%20Guard%20Pro%20early%20access"
          >
            Join early access
          </a>
        </div>
      </section>

      <footer className="shell footer">
        <span>© 2026 API Contract Guard</span>
        <span>OpenAPI is a trademark of the Linux Foundation.</span>
      </footer>
    </main>
  );
}
