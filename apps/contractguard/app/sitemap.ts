import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    ["", 1],
    ["/openapi-breaking-change-detection", 0.9],
    ["/openapi-diff-github-actions", 0.9],
    ["/api-contract-testing", 0.9],
    ["/openapi-backward-compatibility", 0.9],
    ["/marketplace", 0.6],
    ["/support", 0.4],
    ["/terms", 0.2],
    ["/privacy", 0.2],
  ] as const;

  return pages.map(([path, priority]) => ({
    url: `https://apicontractguard.com${path}`,
    lastModified: new Date("2026-07-17"),
    changeFrequency: "weekly" as const,
    priority,
  }));
}
