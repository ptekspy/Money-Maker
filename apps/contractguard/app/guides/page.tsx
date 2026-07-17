import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "OpenAPI compatibility guides | API Contract Guard",
  description:
    "Practical guides to OpenAPI diffs, breaking API changes, schema compatibility and GitHub pull-request checks.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/">
          <span className="brand-mark">CG</span>
          <span>API Contract Guard</span>
        </Link>
        <Link className="nav-link" href="/#checker">
          Free checker
        </Link>
      </nav>
      <article className="guide shell">
        <div className="eyebrow">
          <span /> OPENAPI GUIDES
        </div>
        <h1>
          Make API compatibility <em>automatic</em>
        </h1>
        <p className="guide-intro">
          Practical explanations and tools for detecting breaking OpenAPI
          changes before they reach consumers.
        </p>
        <div className="guide-grid">
          {guides.map((guide, index) => (
            <section key={guide.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>
                <Link href={`/guides/${guide.slug}`}>
                  {guide.title} {guide.accent}
                </Link>
              </h2>
              <p>{guide.description}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
