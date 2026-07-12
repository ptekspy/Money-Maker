import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

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
      </body>
    </html>
  );
}
