import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    ["", 1],
    ["/openapi-breaking-change-detection", 0.9],
    ["/openapi-diff-github-actions", 0.9],
    ["/openapi-diff-tool", 0.9],
    ["/openapi-ci-check", 0.9],
    ["/stop-breaking-api-changes", 0.9],
    ["/api-contract-testing", 0.9],
    ["/openapi-backward-compatibility", 0.9],
    ["/marketplace", 0.6],
    ["/support", 0.4],
    ["/terms", 0.2],
    ["/privacy", 0.2],
  ] as const;

  return [
    ...pages.map(([path, priority]) => ({
      url: `https://apicontractguard.com${path}`,
      lastModified: new Date("2026-07-17"),
      changeFrequency: "weekly" as const,
      priority,
    })),
    {
      url: "https://apicontractguard.com/guides",
      lastModified: new Date("2026-07-17"),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...guides.map((guide) => ({
      url: `https://apicontractguard.com/guides/${guide.slug}`,
      lastModified: new Date("2026-07-17"),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
  ];
}
