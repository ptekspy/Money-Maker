import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "API Contract Guard — Catch breaking OpenAPI changes",
  description:
    "Compare OpenAPI specifications in seconds. Find removed endpoints, required parameters and incompatible schema changes before they reach production.",
  metadataBase: new URL("https://apicontractguard.com"),
  openGraph: {
    title: "API Contract Guard",
    description: "Catch breaking OpenAPI changes before your customers do.",
    url: "https://apicontractguard.com",
    siteName: "API Contract Guard",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
