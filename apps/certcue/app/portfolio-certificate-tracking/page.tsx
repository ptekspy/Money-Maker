import { ArrowRight, BellRing, Check, Files, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing-frame";
import { PortfolioPlans } from "@/components/portfolio-plans";

export const metadata: Metadata = {
  title: "Certificate tracking for portfolio landlords | LetDue",
  description:
    "Track gas safety, EICR, EPC, insurance and property-licence dates across 10, 50 or 100 rental properties without a full letting platform.",
  alternates: { canonical: "/portfolio-certificate-tracking" },
  openGraph: {
    title: "Certificate tracking for portfolio landlords | LetDue",
    description:
      "A focused certificate desk for growing rental portfolios that need documents, dates and reminders—not another letting platform.",
    url: "/portfolio-certificate-tracking",
    siteName: "LetDue",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Certificate tracking for portfolio landlords",
    description:
      "Organise portfolio certificate dates and reminders without buying a full property-management platform.",
  },
};

const differences = [
  [
    "Focused scope",
    "Documents, renewal dates and reminders—without rent collection or tenant messaging.",
  ],
  [
    "Portfolio pricing",
    "Published annual packs for 3, 10, 50 and 100 properties, with custom capacity below 250.",
  ],
  [
    "Practical migration",
    "Start with the dates most likely to cause admin pain and add the rest over time.",
  ],
] as const;

const records = [
  "Gas safety records",
  "EICR reports",
  "EPC expiry dates",
  "Landlord insurance renewals",
  "Property and HMO licence dates",
] as const;

export default function PortfolioCertificateTrackingPage() {
  return (
    <MarketingFrame>
      <section className="overflow-hidden border-[#d5dbc9] border-b px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              Certificate tracking for 4–249 properties
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Your portfolio needs a certificate desk, not another letting
              platform.
            </h1>
            <p className="mt-6 max-w-3xl text-[#526047] text-xl leading-8">
              LetDue keeps rental-property certificates, renewal dates and
              reminders in one focused workflow. Choose capacity for 10, 50 or
              100 properties and add more when the portfolio grows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
                href="/portfolio-health-check?source=portfolio-tracking"
              >
                Get a free portfolio review <ArrowRight size={18} />
              </a>
              <a
                className="inline-flex min-h-13 items-center rounded-lg border border-[#aeb9a7] bg-white px-5 font-black"
                href="#pricing"
              >
                Compare annual packs
              </a>
            </div>
          </div>
          <aside className="rounded-3xl bg-[#18220d] p-6 text-white shadow-xl">
            <Layers3 className="text-[#d9ff73]" size={30} />
            <p className="mt-5 font-black text-[#d9ff73] text-sm uppercase">
              Most popular
            </p>
            <strong className="mt-2 block text-5xl">50 properties</strong>
            <p className="mt-2 text-[#cbd4c5]">£239.50 per year</p>
            <a
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
              href="/signup?pack=50&source=portfolio-tracking-hero"
            >
              Choose the 50-property pack
            </a>
          </aside>
        </div>
      </section>

      <section className="border-[#d5dbc9] border-b bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-black text-[#52720d] text-sm uppercase">
            Deliberately narrower software
          </p>
          <h2 className="mt-3 max-w-4xl text-4xl leading-tight md:text-6xl">
            Pay for the deadline workflow you need.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {differences.map(([title, detail], index) => {
              const Icon =
                index === 0 ? Files : index === 1 ? Layers3 : BellRing;
              return (
                <article
                  className="rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-6"
                  key={title}
                >
                  <Icon className="text-[#52720d]" size={26} />
                  <h3 className="mt-4 text-2xl">{title}</h3>
                  <p className="mt-2 text-[#65715d] leading-7">{detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              One place to look
            </p>
            <h2 className="mt-3 text-4xl leading-tight">
              Move the records that matter first.
            </h2>
            <p className="mt-4 text-[#526047] leading-7">
              You do not need a perfect migration on day one. Start with
              upcoming renewals, then add documents and dates property by
              property.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {records.map((record) => (
              <li
                className="flex min-h-16 items-center gap-3 rounded-xl border border-[#d5dbc9] bg-white p-4 font-bold"
                key={record}
              >
                <Check className="shrink-0 text-[#52720d]" size={20} />
                {record}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PortfolioPlans />

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#18220d] p-7 text-white md:p-10">
          <h2 className="text-3xl md:text-4xl">Not sure which pack fits?</h2>
          <p className="mt-3 max-w-3xl text-[#cbd4c5] leading-7">
            Tell us the size of your portfolio and how you currently track
            dates. We will recommend the smallest sensible setup. LetDue
            organises records and reminders; it does not provide legal advice or
            guarantee compliance.
          </p>
          <a
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
            href="/portfolio-health-check?source=portfolio-tracking-bottom"
          >
            Request the free review <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </MarketingFrame>
  );
}
