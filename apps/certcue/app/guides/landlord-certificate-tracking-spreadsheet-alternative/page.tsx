import { ArrowRight, BellRing, Check, FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing-frame";

export const metadata: Metadata = {
  title: "Landlord certificate tracking spreadsheet alternative | LetDue",
  description:
    "Replace a landlord certificate spreadsheet with a focused reminder dashboard for gas safety, EICR, EPC, insurance and licence dates.",
  alternates: {
    canonical: "/guides/landlord-certificate-tracking-spreadsheet-alternative",
  },
  openGraph: {
    title: "Landlord certificate tracking spreadsheet alternative | LetDue",
    description:
      "A focused way for small landlords in England to track certificate dates without maintaining a spreadsheet.",
    url: "/guides/landlord-certificate-tracking-spreadsheet-alternative",
    siteName: "LetDue",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Landlord certificate tracking spreadsheet alternative",
    description:
      "Track rental-property certificate dates without maintaining a manual spreadsheet.",
  },
};

const spreadsheetProblems = [
  "The expiry date is in the PDF, but not copied into the sheet.",
  "A reminder exists for one certificate, but not the next one.",
  "The sheet is correct until a renewal email arrives and nobody updates it.",
  "You remember to check dates only when something else goes wrong.",
] as const;

const letdueChecks = [
  "Gas safety records",
  "EICR reports",
  "EPC expiry dates",
  "Landlord insurance renewal dates",
  "Property licence dates where they apply",
] as const;

export default function SpreadsheetAlternativePage() {
  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              Spreadsheet alternative
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Stop using a landlord certificate spreadsheet as your memory
            </h1>
            <p className="mt-6 max-w-3xl text-[#526047] text-xl leading-8">
              A spreadsheet can list certificate dates, but it will not read the
              PDF, warn you before a renewal becomes urgent, or keep the next
              action visible every time you add a property.
            </p>
            <p className="mt-4 max-w-3xl font-bold text-[#394430] leading-7">
              LetDue is deliberately smaller than property-management software:
              it tracks certificate and renewal dates for self-managing
              landlords and focused property teams with growing portfolios in
              England.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
                href="/?source=spreadsheet-alternative#audit"
              >
                Run a free property audit <ArrowRight size={18} />
              </a>
              <a
                className="inline-flex min-h-13 items-center rounded-lg border border-[#aeb9a7] bg-white px-5 font-black text-[#18220d]"
                href="/portfolio-health-check?source=spreadsheet-alternative"
              >
                Get a portfolio recommendation
              </a>
            </div>
          </div>
          <aside className="rounded-3xl bg-[#18220d] p-6 text-white">
            <FileSpreadsheet className="text-[#d9ff73]" size={30} />
            <h2 className="mt-5 text-3xl">Useful upgrade</h2>
            <p className="mt-3 text-[#cbd4c5] leading-7">
              Start with one property. Add the dates you know. LetDue turns the
              result into a private dashboard and reminder schedule.
            </p>
            <p className="mt-5 rounded-xl bg-[#26351a] p-4 font-bold text-[#d9ff73]">
              Best for landlords who already have a sheet, folder or email
              trail, but no reliable reminder system.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              Why sheets break
            </p>
            <h2 className="mt-3 text-4xl leading-tight">
              The problem is not the table. It is keeping it current.
            </h2>
            <ul className="mt-6 grid gap-3">
              {spreadsheetProblems.map((item) => (
                <li className="flex gap-3 font-bold" key={item}>
                  <Check className="mt-0.5 text-[#52720d]" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#d5dbc9] bg-[#f7f8f3] p-7">
            <BellRing className="text-[#52720d]" size={30} />
            <h2 className="mt-5 text-3xl">What LetDue adds</h2>
            <p className="mt-3 text-[#526047] leading-7">
              LetDue stores the dates you choose to track and sends reminders at
              90, 30, 14, 7 and 0 days before the deadline. The goal is not to
              replace your judgement; it is to stop key dates disappearing into
              inboxes and folders.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-black text-[#52720d] text-sm uppercase">
            What to move first
          </p>
          <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
            Start with the dates that create real admin pain
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {letdueChecks.map((item) => (
              <article
                className="rounded-2xl border border-[#d5dbc9] bg-white p-5"
                key={item}
              >
                <h3 className="text-xl">{item}</h3>
                <p className="mt-2 text-[#65715d] leading-7">
                  Put the next renewal date somewhere visible, then add a
                  reminder before it becomes urgent.
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-3xl bg-[#18220d] p-7 text-white">
            <h2 className="text-3xl">Try it with one real property</h2>
            <p className="mt-3 max-w-3xl text-[#cbd4c5] leading-7">
              Run the free audit first. If it exposes a date worth putting on
              watch, choose annual capacity for 3, 10, 50 or 100 properties.
            </p>
            <a
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
              href="/?source=spreadsheet-alternative-bottom#audit"
            >
              Check a property <ArrowRight size={18} />
            </a>
          </div>
          <p className="mt-6 text-[#65715d] text-sm leading-6">
            LetDue organises dates, documents and reminders. It does not provide
            legal advice or guarantee that a property complies with every rule
            that applies to it.
          </p>
        </div>
      </section>
    </MarketingFrame>
  );
}
