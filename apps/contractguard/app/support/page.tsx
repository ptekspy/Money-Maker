import { Suspense } from "react";
import { SupportStatus } from "@/components/support-status";

export default function SupportPage() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="/" aria-label="API Contract Guard home">
          <span className="brand-mark">CG</span>
          <span>API Contract Guard</span>
        </a>
        <div className="nav-actions">
          <a className="nav-link" href="https://app.apicontractguard.com">
            Install
          </a>
        </div>
      </nav>
      <section className="legal supportPage shell">
        <p className="eyebrow">SUPPORT</p>
        <h1>Contact support</h1>
        <p className="legalIntro">
          Ask about setup, billing, privacy, or OpenAPI check results. If you
          are already signed in, use the dashboard support form so we can see
          the installation context automatically.
        </p>
        <Suspense fallback={null}>
          <SupportStatus />
        </Suspense>
        <div className="supportLayout">
          <form
            className="contactForm"
            action="https://app.apicontractguard.com/api/support/contact"
            method="post"
          >
            <input type="hidden" name="source" value="public" />
            <input
              type="hidden"
              name="returnTo"
              value="https://apicontractguard.com/support"
            />
            <label className="hiddenField">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <label>
              Your name
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Company or GitHub org <span>optional</span>
              <input name="company" autoComplete="organization" />
            </label>
            <label>
              What do you need help with?
              <select name="issueType" defaultValue="setup">
                <option value="setup">Setup or install</option>
                <option value="billing">Billing</option>
                <option value="check-result">Check result</option>
                <option value="privacy">Privacy or data</option>
                <option value="general">General question</option>
              </select>
            </label>
            <label>
              Pull request or check URL <span>optional</span>
              <input name="prUrl" type="url" placeholder="https://github.com/..." />
            </label>
            <label>
              Message
              <textarea
                name="message"
                minLength={10}
                required
                placeholder="Tell us what happened and what you expected to happen."
              />
            </label>
            <button className="button primary" type="submit">
              Send message
            </button>
          </form>
          <div className="supportCards">
            <article>
              <h2>Email</h2>
              <p>
                You can also email support@apicontractguard.com directly. Include
                your GitHub organization, repository, pull request, and check
                output when reporting a check issue.
              </p>
            </article>
            <article>
              <h2>Install help</h2>
              <p>
                Install the GitHub App, choose repositories, then open a pull
                request that changes openapi.yaml, openapi.yml, openapi.json,
                swagger.yaml, swagger.yml, or swagger.json.
              </p>
            </article>
            <article>
              <h2>Live proof</h2>
              <p>
                The demo repository shows a removed 200 response being blocked
                at github.com/ptekspy/contract-guard-live-demo/pull/1/checks.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
