import { ArrowRight, BellRing, CalendarDays, FileSearch } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing-frame";

export const metadata: Metadata = {
  title: "Landlord certificate renewal reminders | LetDue",
  description:
    "Track gas safety, EICR, EPC, insurance and licence renewal dates for small rental portfolios in England without relying on spreadsheets.",
  alternates: { canonical: "/guides/landlord-certificate-renewal-reminders" },
  openGraph: {
    title: "Landlord certificate renewal reminders | LetDue",
    description:
      "A practical guide for keeping gas safety, EICR, EPC, insurance and licence dates on watch.",
    url: "/guides/landlord-certificate-renewal-reminders",
    siteName: "LetDue",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Landlord certificate renewal reminders",
    description:
      "A practical guide for keeping rental-property certificate dates on watch.",
  },
};

const reminders = [
  {
    title: "Gas safety records",
    detail:
      "Keep the issue/check date visible and schedule annual renewal prompts before the certificate becomes urgent.",
  },
  {
    title: "EICR reports",
    detail:
      "Track the next-inspection date shown on the electrical report instead of guessing from the file name.",
  },
  {
    title: "EPCs",
    detail:
      "Store the valid EPC and its expiry date, especially when a property is close to sale, letting or remortgage admin.",
  },
  {
    title: "Insurance and licences",
    detail:
      "Add landlord insurance, HMO licences and local selective/additional licensing dates where they apply.",
  },
] as const;

export default function CertificateRenewalRemindersPage() {
  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              Certificate renewal reminders
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Stop finding expired landlord certificates by accident
            </h1>
            <p className="mt-6 max-w-3xl text-[#526047] text-xl leading-8">
              LetDue is a small certificate desk for self-managing landlords in
              England. Upload or enter the dates for gas safety, EICR, EPC,
              insurance and licence records, then get a reminder calendar for
              the next action.
            </p>
            <p className="mt-4 max-w-3xl font-bold text-[#394430] leading-7">
              It is built for one to three rental properties. No rent
              collection, tenant management or agency workflow.
            </p>
            <a
              className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
              href="/?source=certificate-renewal-reminders#audit"
            >
              Run a free certificate audit <ArrowRight size={18} />
            </a>
          </div>
          <aside className="rounded-3xl bg-[#18220d] p-6 text-white">
            <BellRing className="text-[#d9ff73]" size={28} />
            <h2 className="mt-5 text-3xl">Reminder schedule</h2>
            <p className="mt-3 text-[#cbd4c5] leading-7">
              LetDue warns you 90, 30, 14 and 7 days before a tracked date, then
              again on the due date.
            </p>
            <p className="mt-5 rounded-xl bg-[#26351a] p-4 font-bold text-[#d9ff73]">
              Useful when the certificate PDF is saved, but the renewal date is
              not written down anywhere.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="font-black text-[#52720d] text-sm uppercase">
              What to put on watch
            </p>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
              The dates landlords most often lose in folders
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {reminders.map((item) => (
              <article
                className="rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-6"
                key={item.title}
              >
                <CalendarDays className="text-[#52720d]" size={25} />
                <h3 className="mt-4 text-2xl">{item.title}</h3>
                <p className="mt-2 text-[#65715d] leading-7">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-3xl border border-[#d5dbc9] bg-white p-7">
            <FileSearch className="text-[#52720d]" size={28} />
            <h2 className="mt-5 text-3xl">Free first step</h2>
            <p className="mt-3 text-[#526047] leading-7">
              Run one real property through the free audit. If the result is
              useful, start the no-card pilot or pay £28/year for ongoing
              monitoring across up to three properties.
            </p>
            <a
              className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-[#18220d] px-5 font-black text-white"
              href="/?source=certificate-renewal-reminders#audit"
            >
              Check a property
            </a>
          </div>
          <div>
            <h2 className="text-3xl">Important limit</h2>
            <p className="mt-3 text-[#526047] leading-7">
              LetDue organises records and reminders. It does not replace
              professional advice, local council checks or the official rules
              that apply to a specific property, tenancy or licence.
            </p>
          </div>
        </div>
      </section>
    </MarketingFrame>
  );
}
