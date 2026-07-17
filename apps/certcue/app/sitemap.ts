import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://letdue.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://letdue.com/privacy",
      lastModified: new Date("2026-07-15"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: "https://letdue.com/terms",
      lastModified: new Date("2026-07-15"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
