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
      url: "https://letdue.com/tools/gas-safety-certificate-expiry-calculator",
      lastModified: new Date("2026-07-17"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://letdue.com/tools/eicr-renewal-calculator",
      lastModified: new Date("2026-07-17"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://letdue.com/guides/landlord-compliance-checklist-england",
      lastModified: new Date("2026-07-17"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://letdue.com/guides/landlord-certificate-renewal-reminders",
      lastModified: new Date("2026-07-28"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://letdue.com/guides/landlord-certificate-tracking-spreadsheet-alternative",
      lastModified: new Date("2026-07-29"),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: "https://letdue.com/partners/certificate-aftercare",
      lastModified: new Date("2026-07-29"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://letdue.com/founding-plan",
      lastModified: new Date("2026-07-29"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://letdue.com/terms",
      lastModified: new Date("2026-07-15"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
