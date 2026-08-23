import { ArrowRight, ClipboardCheck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing-frame";
import { PortfolioHealthCheckForm } from "@/components/portfolio-health-check-form";

export const metadata: Metadata = {
  title: "Free landlord portfolio certificate health check | LetDue",
  description:
    "Get a free founder review of how your rental portfolio tracks gas safety, EICR, EPC, insurance and property-licence dates.",
  alternates: { canonical: "/portfolio-health-check" },
  openGraph: {
    title: "Free portfolio certificate health check | LetDue",
    description:
      "A practical review for landlords who want a simpler way to organise certificate and renewal dates across a growing portfolio.",
    url: "/portfolio-health-check",
    siteName: "LetDue",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Free portfolio certificate health check",
    description:
      "Tell LetDue how you track portfolio dates today and get a practical setup recommendation.",
  },
};

const outcomes = [
  "A sensible starting pack for the size of your portfolio",
  "Which certificate and renewal records to move first",
  "Whether LetDue is genuinely simpler than your current setup",
] as const;

export default async function PortfolioHealthCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const formStatus =
    status === "sent" || status === "error" ? status : undefined;

  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_390px] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              For growing portfolios
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Find the weak point in your certificate tracking before a date is
              missed.
            </h1>
            <p className="mt-6 max-w-3xl text-[#526047] text-xl leading-8">
              Tell us how many properties you manage and where the dates live
              today. We will recommend the smallest useful LetDue setup—without
              pushing you into a full property-management platform.
            </p>
            <a
              className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
              href="#portfolio-review"
            >
              Request the free review <ArrowRight size={18} />
            </a>
          </div>
          <aside className="rounded-3xl bg-[#18220d] p-6 text-white">
            <ClipboardCheck className="text-[#d9ff73]" size={30} />
            <h2 className="mt-5 text-3xl">What you get</h2>
            <ul className="mt-5 grid gap-4 text-[#cbd4c5] leading-7">
              {outcomes.map((outcome) => (
                <li className="border-white/15 border-t pt-4" key={outcome}>
                  {outcome}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <PortfolioHealthCheckForm status={formStatus} />

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[#d5dbc9] bg-[#f7f8f3] p-7 md:p-10">
          <ShieldCheck className="text-[#52720d]" size={30} />
          <h2 className="mt-5 text-3xl">
            A focused software check, not a legal audit
          </h2>
          <p className="mt-3 max-w-3xl text-[#526047] leading-7">
            We will look at your record-keeping and reminder workflow. LetDue
            does not inspect properties, determine every rule that applies or
            guarantee compliance. You remain responsible for checking the
            original records and obtaining professional advice where needed.
          </p>
        </div>
      </section>
    </MarketingFrame>
  );
}
