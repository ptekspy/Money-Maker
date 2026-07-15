import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for QuoteWinBack recovery scans, pilot work, file handling, and follow-up output.",
};

const sections = [
  {
    title: "Service",
    body: [
      "QuoteWinBack provides missed revenue recovery support for UK trade and local service businesses. This may include reviewing old quotes, missed enquiries, paid leads, customer messages, and related files.",
      "Outputs may include a recovery CSV, opportunity scoring, follow-up drafts, and practical recommendations.",
    ],
  },
  {
    title: "Pilot scans",
    body: [
      "For a pilot scan, you provide the files or records you want reviewed. You confirm you are allowed to share those records with us for this purpose.",
      "Unless agreed otherwise in writing, we do not send follow-up messages directly to your customers. You approve, send, and manage any customer communication.",
    ],
  },
  {
    title: "Data deletion",
    body: [
      "Files, exports, quote records, and scan outputs provided for a pilot are deleted within 14 days of receipt unless we enter into a contracted agreement with you.",
      "If we enter into a contracted agreement, we may keep the data needed to provide the ongoing service so you do not have to resend files. The contract can include a specific retention period, deletion process, and any extra requirements.",
    ],
  },
  {
    title: "Your responsibilities",
    body: [
      "You are responsible for checking that the data you provide is accurate enough for the scan and that using it for follow-up is appropriate for your business.",
      "You are responsible for approving any customer-facing message before it is sent and for complying with applicable marketing, privacy, and trading rules when you contact customers.",
    ],
  },
  {
    title: "Results",
    body: [
      "We aim to find practical recovery opportunities, but we cannot guarantee sales, bookings, replies, or revenue.",
      "Pipeline values are estimates based on the information supplied and should not be treated as guaranteed income.",
    ],
  },
  {
    title: "Payment and contracts",
    body: [
      "Any paid service, monthly support, or ongoing data retention will be covered by a separate written agreement, order, or invoice terms.",
      "If there is a conflict between these website terms and a signed contract, the signed contract takes priority for that agreed work.",
    ],
  },
  {
    title: "Liability",
    body: [
      "The service is provided for business use. We are not responsible for losses caused by inaccurate source data, unapproved changes, customer communication sent by you, or decisions you make based on the output.",
      "Nothing in these terms limits liability that cannot legally be limited.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-18">
        <p className="mb-3 font-extrabold text-[#176b4f] text-sm uppercase">
          Legal
        </p>
        <h1 className="mb-5 text-5xl leading-none md:text-7xl">
          Terms of service
        </h1>
        <p className="mb-10 max-w-3xl text-[#5d6c67] text-lg leading-8">
          Last updated 12 July 2026. These terms cover QuoteWinBack pilot scans
          and website enquiries. Contracted services can have additional terms.
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
