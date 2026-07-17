import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing-frame";

export const metadata: Metadata = {
  title: "Landlord compliance checklist for England | LetDue",
  description:
    "A plain-English starting checklist for rental property certificates, safety records and recurring dates landlords in England should organise.",
  alternates: { canonical: "/guides/landlord-compliance-checklist-england" },
};

const checklist = [
  {
    title: "Gas safety record",
    detail:
      "Arrange annual checks for landlord-provided gas appliances and flues, and keep the current record available.",
  },
  {
    title: "Electrical installation report (EICR)",
    detail:
      "Keep the latest inspection report and use its next-inspection date; checks are required at least every five years in England.",
  },
  {
    title: "Energy Performance Certificate",
    detail:
      "Keep the valid EPC for the property. A domestic EPC is generally valid for ten years or until a newer one is produced.",
  },
  {
    title: "Smoke and carbon monoxide alarms",
    detail:
      "Record installation and testing, and check the current rules that apply to the property and fuel-burning appliances.",
  },
  {
    title: "Deposit and tenancy paperwork",
    detail:
      "Keep evidence of deposit protection, prescribed information and the documents supplied to the tenant.",
  },
  {
    title: "Local or HMO licence",
    detail:
      "Check the local council's licensing schemes and put any licence renewal date on watch.",
  },
] as const;

export default function LandlordChecklistPage() {
  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="font-black text-[#52720d] text-sm uppercase">
            England landlord guide
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
            A landlord compliance checklist you can actually keep current
          </h1>
          <p className="mt-6 max-w-3xl text-[#526047] text-xl leading-8">
            Use this as an organising prompt, then check the official rules for
            your tenancy, property and council. The profitable habit is simple:
            keep the evidence and put every recurring date somewhere that will
            warn you.
          </p>
          <a
            className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
            href="/?source=landlord-checklist#audit"
          >
            Audit a property free <ArrowRight size={18} />
          </a>
        </div>
      </section>
      <section className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          {checklist.map((item) => (
            <article
              className="rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-6"
              key={item.title}
            >
              <CheckCircle2 className="text-[#52720d]" size={25} />
              <h2 className="mt-4 text-2xl">{item.title}</h2>
              <p className="mt-2 text-[#65715d] leading-7">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#18220d] p-7 text-white md:p-10">
          <h2 className="text-4xl">Turn the checklist into reminders</h2>
          <p className="mt-4 text-[#cbd4c5] text-lg leading-8">
            LetDue stores the certificates, reads their dates and sends warnings
            at 90, 30, 14, 7 and 0 days. Start with one property and no card.
          </p>
          <a
            className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
            href="/?source=landlord-checklist#audit"
          >
            Start the free 14-day pilot
          </a>
          <p className="mt-4 text-[#aeb9a7] text-sm">
            This checklist is general information, not legal advice. Rules can
            vary by property, tenancy and local council.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <h2 className="text-2xl">Official starting points</h2>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 font-black text-[#52720d] underline">
            <a
              href="https://www.gov.uk/renting-out-a-property/landlord-responsibilities"
              rel="noreferrer"
              target="_blank"
            >
              GOV.UK landlord responsibilities
            </a>
            <a
              href="https://www.hse.gov.uk/gas/landlords/safetycheckswhat.htm"
              rel="noreferrer"
              target="_blank"
            >
              HSE gas safety checks
            </a>
            <a
              href="https://www.gov.uk/government/publications/electrical-safety-standards-in-the-private-and-social-rented-sectors-guidance"
              rel="noreferrer"
              target="_blank"
            >
              GOV.UK electrical safety guidance
            </a>
          </div>
        </div>
      </section>
    </MarketingFrame>
  );
}
