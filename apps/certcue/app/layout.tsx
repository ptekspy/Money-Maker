import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://letdue.com"),
  title: "LetDue | Certificate reminders for small landlords",
  description:
    "LetDue reads rental-property certificates, builds a clear deadline calendar, and reminds small landlords in England before important dates expire.",
  icons: {
    icon: "/brand/letdue-icon.svg",
    shortcut: "/brand/letdue-icon.svg",
    apple: "/brand/letdue-icon.svg",
  },
  alternates: { canonical: "/" },
  openGraph: {
    title: "LetDue | Know what expires next",
    description:
      "Certificate storage and deadline reminders for self-managing landlords with one to three properties.",
    type: "website",
    url: "https://letdue.com",
    siteName: "LetDue",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LetDue | Know what expires next",
    description:
      "Certificate storage and deadline reminders for self-managing landlords in England.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-[#f4f5ef] font-sans text-[#18220d] antialiased">
        {children}
      </body>
    </html>
  );
}
