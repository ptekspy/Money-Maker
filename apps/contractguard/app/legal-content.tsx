type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
};

export function LegalPage({ eyebrow, title, intro, sections }: LegalPageProps) {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="/" aria-label="API Contract Guard home">
          <span className="brand-mark">CG</span>
          <span>API Contract Guard</span>
        </a>
        <div className="nav-actions">
          <a className="nav-link" href="/support">
            Support
          </a>
          <a className="nav-link" href="https://app.apicontractguard.com">
            Install
          </a>
        </div>
      </nav>
      <section className="legal shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legalIntro">{intro}</p>
        <div className="legalGrid">
          {sections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
