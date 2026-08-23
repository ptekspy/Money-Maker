import { ArrowRight, BadgeCheck, Handshake, MailCheck } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing-frame";

export const metadata: Metadata = {
  title: "Certificate aftercare for landlord customers | LetDue",
  description:
    "A simple aftercare handoff for gas safety, EICR, EPC, fire-risk and HMO certificate suppliers whose landlord customers need renewal reminders.",
  alternates: { canonical: "/partners/certificate-aftercare" },
  openGraph: {
    title: "Certificate aftercare for landlord customers | LetDue",
    description:
      "A simple renewal-reminder handoff for certificate suppliers whose landlord customers need to remember what expires next.",
    url: "/partners/certificate-aftercare",
    siteName: "LetDue",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Certificate aftercare for landlord customers",
    description:
      "A simple renewal-reminder handoff for certificate suppliers and landlord-service partners.",
  },
};

const steps = [
  {
    title: "You issue the report",
    detail:
      "Gas safety, EICR, EPC, fire-risk, HMO or insurance paperwork stays with your existing process.",
  },
  {
    title: "The landlord runs a free audit",
    detail:
      "They upload or enter the dates they already have. LetDue turns those dates into a plain reminder calendar.",
  },
  {
    title: "Useful customers can continue",
    detail:
      "If the calendar helps, they can choose annual capacity for 3, 10, 50 or 100 properties and grow later.",
  },
] as const;

export default function CertificateAftercarePartnerPage() {
  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_390px] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              For certificate suppliers
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Give landlords a clean next step after the certificate is issued
            </h1>
            <p className="mt-6 max-w-3xl text-[#526047] text-xl leading-8">
              LetDue starts after your inspection, assessment or report. It
              gives landlords a free way to check the renewal dates they now
              need to remember, then offers focused paid monitoring if it helps.
            </p>
            <p className="mt-4 max-w-3xl font-bold text-[#394430] leading-7">
              This is not a booking platform, agency system or replacement for
              your compliance advice. It is a simple reminder handoff for
              self-managing landlords and growing portfolios.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
                href="/?source=certificate-aftercare-partner#audit"
              >
                Try the free audit <ArrowRight size={18} />
              </a>
              <a
                className="inline-flex min-h-13 items-center rounded-lg border border-[#aeb9a7] px-5 font-black text-[#18220d]"
                href="mailto:hello@letdue.com?subject=Certificate%20aftercare%20partner%20idea"
              >
                Discuss a partner handoff
              </a>
            </div>
          </div>
          <aside className="rounded-3xl bg-[#18220d] p-6 text-white">
            <Handshake className="text-[#d9ff73]" size={30} />
            <h2 className="mt-5 text-3xl">Simple partner line</h2>
            <p className="mt-3 text-[#cbd4c5] leading-7">
              “Once your certificate is issued, use LetDue to put the next
              renewal date somewhere that will remind you.”
            </p>
            <p className="mt-5 rounded-xl bg-[#26351a] p-4 font-bold text-[#d9ff73]">
              No customer list required. We can give you one trackable handover
              link and copy that fits naturally into your completion email.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="font-black text-[#52720d] text-sm uppercase">
              How the handoff works
            </p>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
              Keep the inspection work with you. LetDue handles the reminder
              habit.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article
                className="rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-6"
                key={step.title}
              >
                <BadgeCheck className="text-[#52720d]" size={25} />
                <h3 className="mt-4 text-2xl">{step.title}</h3>
                <p className="mt-2 text-[#65715d] leading-7">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="rounded-3xl border border-[#d5dbc9] bg-white p-7">
            <MailCheck className="text-[#52720d]" size={28} />
            <h2 className="mt-5 text-3xl">Copy-ready handover text</h2>
            <p className="mt-3 rounded-2xl bg-[#f7f8f3] p-4 text-[#526047] leading-7">
              If you want help remembering when this certificate needs action
              again, LetDue has a free landlord deadline audit:
              letdue.com/?source=certificate-aftercare
            </p>
            <p className="mt-4 text-[#65715d] text-sm leading-6">
              For an individual partner link using your trading name, email
              hello@letdue.com. You keep the inspection and renewal
              relationship; LetDue supplies the document-and-reminder handoff.
            </p>
          </div>
          <div>
            <h2 className="text-3xl">Clear limit</h2>
            <p className="mt-3 text-[#526047] leading-7">
              LetDue organises documents, dates and reminders. Landlords should
              still check the official rules, the local council position and any
              professional advice that applies to their property.
            </p>
          </div>
        </div>
      </section>
    </MarketingFrame>
  );
}
