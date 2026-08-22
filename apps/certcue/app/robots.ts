import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/account",
        "/login",
        "/offer/",
        "/api/",
        "/welcome",
      ],
    },
    sitemap: "https://letdue.com/sitemap.xml",
  };
}
