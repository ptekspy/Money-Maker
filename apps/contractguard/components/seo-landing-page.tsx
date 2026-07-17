import Link from "next/link";

const appUrl = "https://app.apicontractguard.com";
const demoUrl =
  "https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks";

type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
};

export function SeoLandingPage({
  eyebrow,
  title,
  accent,
  intro,
  sections,
  faq,
}: SeoLandingPageProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/" aria-label="API Contract Guard home">
          <span className="brand-mark">CG</span>
          <span>API Contract Guard</span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-link" href="/#checker">
            Free checker
          </Link>
          <a className="nav-link" href={`${appUrl}/api/auth/github/start`}>
            Sign in
          </a>
        </div>
      </nav>

      <article className="guide shell">
        <div className="eyebrow">
          <span /> {eyebrow}
        </div>
        <h1>
          {title} <em>{accent}</em>
        </h1>
        <p className="guide-intro">{intro}</p>
        <div className="hero-actions">
          <Link className="button primary" href="/#checker">
            Try the free checker
          </Link>
          <a className="button secondary" href={demoUrl}>
            View a real GitHub check
          </a>
        </div>

        <div className="guide-grid">
          {sections.map((section, index) => (
            <section key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <section className="guide-cta">
          <div>
            <span className="step">AUTOMATE THE CHECK</span>
            <h2>Protect every pull request automatically</h2>
            <p>
              Install the GitHub App, choose a repository and get a clear pass
              or fail status whenever its OpenAPI contract changes.
            </p>
          </div>
          <a className="button secondary" href={appUrl}>
            Start 14-day trial
          </a>
        </section>

        <section className="faq">
          <span className="step">COMMON QUESTIONS</span>
          <h2>Frequently asked questions</h2>
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      </article>

      <footer className="shell footer">
        <span>Copyright 2026 API Contract Guard</span>
        <div>
          <Link href="/">Home</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/support">Support</Link>
        </div>
      </footer>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </main>
  );
}
