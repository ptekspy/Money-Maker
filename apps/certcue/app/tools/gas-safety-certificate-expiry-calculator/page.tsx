import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { DeadlineCalculator } from "@/components/deadline-calculator";
import { MarketingFrame } from "@/components/marketing-frame";

export const metadata: Metadata = {
  title: "Gas safety certificate expiry calculator for landlords | LetDue",
  description:
    "Enter your gas safety certificate expiry date and see the 90, 30, 14, 7 and due-date reminders to schedule for your rental property.",
  alternates: { canonical: "/tools/gas-safety-certificate-expiry-calculator" },
};

const officialSource =
  "https://www.hse.gov.uk/gas/landlords/safetycheckswhat.htm";

export default function GasSafetyCalculatorPage() {
  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_430px] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              Free landlord tool
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Gas safety certificate expiry calculator
            </h1>
            <p className="mt-6 max-w-2xl text-[#526047] text-xl leading-8">
              Put the date from your current record into the calculator. You
              will get a practical reminder schedule long before the annual
              deadline arrives.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                "Annual checks for landlord-provided gas appliances and flues",
                "Five warning dates before expiry",
                "A free route into ongoing certificate monitoring",
              ].map((item) => (
                <p className="flex gap-3 font-bold" key={item}>
                  <CheckCircle2 className="shrink-0 text-[#52720d]" size={21} />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <DeadlineCalculator
            certificateName="Gas safety certificate"
            source="gas-safety-calculator"
          />
        </div>
      </section>
      <section className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8">
        <article className="mx-auto max-w-3xl">
          <h2 className="text-3xl">How often is a gas safety check needed?</h2>
          <p className="mt-4 text-[#526047] leading-8">
            The Health and Safety Executive says landlord-provided gas
            appliances and flues must receive a gas safety check every year. HSE
            guidance also describes a flexible window that can allow a check in
            the two months before the due date while retaining the existing
            annual cycle.
          </p>
          <p className="mt-4 text-[#526047] leading-8">
            Use the expiry or due date shown on your record, and confirm the
            correct timing with your Gas Safe registered engineer. LetDue
            organises dates and evidence; it does not replace professional or
            legal advice.
          </p>
          <a
            className="mt-5 inline-block font-black text-[#52720d] underline"
            href={officialSource}
            rel="noreferrer"
            target="_blank"
          >
            Read the official HSE gas safety guidance
          </a>
        </article>
      </section>
    </MarketingFrame>
  );
}
