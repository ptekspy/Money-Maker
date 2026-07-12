import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How QuoteWinBack handles enquiry files, quote data, contact details, and retention for recovery scans.",
};

const sections = [
  {
    title: "Who we are",
    body: [
      "QuoteWinBack helps UK trade and local service businesses review old quotes, missed enquiries, paid leads, and related follow-up records.",
      "For privacy questions, contact hello@quotewinback.co.uk.",
    ],
  },
  {
    title: "What data we may receive",
    body: [
      "Client contact details, business details, quote or enquiry records, lead source information, notes, job values, follow-up status, and any files you choose to send for a recovery scan.",
      "Customer records supplied by a client may contain personal data such as names, phone numbers, email addresses, addresses, messages, and job details.",
    ],
  },
  {
    title: "Why we use it",
    body: [
      "We use the data to assess missed revenue opportunities, prepare recovery queues, draft follow-up messages, report outcomes, provide support, and discuss whether to continue under a paid service agreement.",
      "We do not sell client files or customer data.",
    ],
  },
  {
    title: "Retention",
    body: [
      "Pilot files, enquiry exports, quote records, and analysis outputs are deleted within 14 days of receipt unless we enter into a contracted agreement with you.",
      "If we enter into a contracted agreement, we may keep the data needed to provide the service so you do not have to resend files. The agreement can set a different retention period, deletion process, and any client-specific security requirements.",
      "Basic business records, invoices, correspondence, and audit notes may be kept for longer where needed for tax, legal, accounting, dispute handling, or legitimate business administration.",
    ],
  },
  {
    title: "How we protect it",
    body: [
      "We limit access to the people and systems needed to run the recovery scan or agreed service.",
      "Where practical, files are kept in controlled cloud storage or workspace tools, and outputs are shared only with the relevant client contact.",
      "Please do not send special category data unless we have agreed in writing that it is necessary.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "We may use trusted processors such as hosting, email, cloud storage, spreadsheet, document, analytics, and AI tooling providers where needed to deliver the service.",
      "We may also share data if required by law, to protect our rights, or to prevent misuse of the service.",
    ],
  },
  {
    title: "Your choices and rights",
    body: [
      "You can ask us to delete pilot files earlier than 14 days by emailing hello@quotewinback.co.uk.",
      "Individuals may have rights under UK data protection law, including access, correction, deletion, restriction, objection, and complaint rights. If a request relates to data supplied by one of our clients, we may direct the request to that client where they are the relevant controller.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-18">
        <p className="mb-3 font-extrabold text-[#176b4f] text-sm uppercase">
          Legal
        </p>
        <h1 className="mb-5 text-5xl leading-none md:text-7xl">
          Privacy notice
        </h1>
        <p className="mb-10 max-w-3xl text-[#5d6c67] text-lg leading-8">
          Last updated 12 July 2026. This page explains how QuoteWinBack handles
          data sent for recovery scans and paid services.
        </p>
        <div className="grid gap-4">
          {sections.map((section) => (
            <section
              className="rounded-lg border border-[#d8e2de] bg-white p-6"
              key={section.title}
            >
              <h2 className="mb-3 font-extrabold text-2xl">{section.title}</h2>
              <div className="grid gap-3 text-[#5d6c67] leading-7">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
