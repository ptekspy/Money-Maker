import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "CertCue — Property compliance, before it becomes urgent",
  description:
    "CertCue reads UK rental-property certificates, builds a compliance calendar, and reminds landlords before important dates expire.",
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
