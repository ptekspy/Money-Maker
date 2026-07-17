import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsConsent } from "@/components/analytics-consent";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "API Contract Guard - Block breaking OpenAPI changes",
  description:
    "Automated GitHub pull-request checks that block breaking OpenAPI changes before merge.",
  metadataBase: new URL("https://apicontractguard.com"),
  openGraph: {
    title: "API Contract Guard",
    description:
      "Block breaking OpenAPI changes before merge with automated GitHub PR checks.",
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
      <body>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
