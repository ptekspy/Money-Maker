const demoUrl =
  "https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks";

export default function MarketplacePage() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="/" aria-label="API Contract Guard home">
          <span className="brand-mark">CG</span>
          <span>API Contract Guard</span>
        </a>
        <div className="nav-actions">
          <a className="nav-link" href={demoUrl}>
            Live proof
          </a>
          <a className="nav-link" href="https://app.apicontractguard.com">
            Install
          </a>
        </div>
      </nav>
      <section className="legal shell">
        <p className="eyebrow">MARKETPLACE ASSETS</p>
        <h1>GitHub App listing kit</h1>
        <p className="legalIntro">
          Use these blocks for screenshots, listing copy, and a fast demo of the
          install-to-check flow.
        </p>
        <div className="marketplacePanels">
          <article>
            <span>Step 1</span>
            <h2>Install the GitHub App</h2>
            <p>
              Choose all repositories or selected repositories. No card is
              required for the 14-day trial.
            </p>
          </article>
          <article>
            <span>Step 2</span>
            <h2>Open a pull request</h2>
            <p>
              Contract Guard looks for OpenAPI or Swagger JSON/YAML files and
              compares the head branch against the base branch.
            </p>
          </article>
          <article>
            <span>Step 3</span>
            <h2>Block breaking changes</h2>
            <p>
              The demo PR fails with one breaking change: GET /health - 200
              response was removed.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
