import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Contract Guard",
  description:
    "Automatic OpenAPI breaking-change checks for every pull request.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
