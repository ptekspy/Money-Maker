import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { DeadlineCalculator } from "@/components/deadline-calculator";
import { MarketingFrame } from "@/components/marketing-frame";

export const metadata: Metadata = {
  title: "EICR renewal date and reminder calculator | LetDue",
  description:
    "Plan reminders for your rental property's EICR next-inspection date and keep the electrical safety report on watch.",
  alternates: { canonical: "/tools/eicr-renewal-calculator" },
};

const officialSource =
  "https://www.gov.uk/government/publications/electrical-safety-standards-in-the-private-and-social-rented-sectors-guidance/electrical-safety-standards-in-the-private-and-social-rented-sectors-guidance";

export default function EicrCalculatorPage() {
  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_430px] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              Free landlord tool
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              EICR renewal reminder calculator
            </h1>
            <p className="mt-6 max-w-2xl text-[#526047] text-xl leading-8">
              Enter the next inspection date written on your report and see when
              to start arranging the work, chasing access and filing the
              replacement EICR.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                "Reminder dates from 90 days before the inspection is due",
                "Designed for self-managing landlords in England",
                "Store the report and monitor up to three properties",
              ].map((item) => (
                <p className="flex gap-3 font-bold" key={item}>
                  <CheckCircle2 className="shrink-0 text-[#52720d]" size={21} />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <DeadlineCalculator
            certificateName="EICR next-inspection"
            source="eicr-calculator"
          />
        </div>
      </section>
      <section className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8">
        <article className="mx-auto max-w-3xl">
          <h2 className="text-3xl">When does an EICR need renewing?</h2>
          <p className="mt-4 text-[#526047] leading-8">
            Current government guidance for England says electrical
            installations in rented properties must be inspected and tested by a
            qualified person at least every five years. The report normally
            gives the date for the next inspection, and an earlier date may be
            required.
          </p>
          <p className="mt-4 text-[#526047] leading-8">
            Use the next-inspection date on the report rather than assuming a
            five-year date. LetDue tracks the document and reminders, but does
            not decide whether remedial work or an earlier inspection is needed.
          </p>
          <a
            className="mt-5 inline-block font-black text-[#52720d] underline"
            href={officialSource}
            rel="noreferrer"
            target="_blank"
          >
            Read the official electrical safety guidance
          </a>
        </article>
      </section>
    </MarketingFrame>
  );
}
