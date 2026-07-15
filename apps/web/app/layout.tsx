import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-WZC9Y5NE19";

export const metadata: Metadata = {
  metadataBase: new URL("https://quotewinback.co.uk"),
  title: {
    default: "QuoteWinBack - Recover Old Quotes Before They Go Cold",
    template: "%s | QuoteWinBack",
  },
  description:
    "QuoteWinBack helps trade businesses recover old quotes, missed enquiries, and paid leads before they go cold.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#f5f7f8] font-sans text-[#102820] antialiased">
        {children}
        <GoogleAnalytics measurementId={gaMeasurementId} />
      </body>
    </html>
  );
}
