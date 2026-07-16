import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://apicontractguard.com",
      lastModified: new Date("2026-07-16"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
