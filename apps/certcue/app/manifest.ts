import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LetDue",
    short_name: "LetDue",
    description:
      "Certificate storage and deadline reminders for self-managing landlords in England.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5ef",
    theme_color: "#18220d",
    icons: [
      {
        src: "/brand/letdue-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
