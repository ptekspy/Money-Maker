import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing-frame";

export const metadata: Metadata = {
  title: "LetDue founding plan | £29/year for small landlords",
  description:
    "LetDue's £29/year founding plan monitors certificate and renewal dates for up to three rental properties in England.",
  alternates: { canonical: "/founding-plan" },
  openGraph: {
    title: "LetDue founding plan | £29/year",
    description:
      "A focused certificate reminder desk for self-managing landlords with one to three properties.",
    url: "/founding-plan",
    siteName: "LetDue",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "LetDue founding plan | £29/year",
    description:
      "Monitor certificate and renewal dates for up to three rental properties.",
  },
};

const included = [
  "Monitor up to three rental properties",
  "Store gas safety, EICR, EPC, insurance and licence dates",
  "Upload certificate PDFs or enter dates manually",
  "Receive reminders at 90, 30, 14, 7 and 0 days",
  "Keep a private dashboard for documents and next actions",
] as const;

const goodFit = [
  "You self-manage one to three properties",
  "Your dates currently live in email, folders or a spreadsheet",
  "At least one certificate, licence or insurance date needs tracking",
] as const;

const faqs = [
  {
    question: "Do I have to move all properties in today?",
    answer:
      "No. Start with one real property and add up to two more from the private dashboard when you have the dates ready.",
  },
  {
    question: "What happens after payment?",
    answer:
      "Stripe confirms checkout, LetDue creates your private dashboard, and the dashboard link is emailed to the address used at checkout.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Yes. The plan is deliberately small and simple. If you cancel, ongoing paid monitoring stops at the end of the active billing period.",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. LetDue organises documents, dates and reminders. You still need to check the official rules, local council position and any professional advice that applies to the property.",
  },
] as const;

export default function FoundingPlanPage() {
  return (
    <MarketingFrame>
      <section className="px-4 py-14 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_390px] lg:items-start">
          <div>
            <p className="font-black text-[#52720d] text-sm uppercase">
              Founding customer plan
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
              Pay £29 once. Put your next landlord deadline on watch today.
            </h1>
            <p className="mt-6 max-w-3xl text-[#526047] text-xl leading-8">
              LetDue is for self-managing landlords in England who need a small,
              practical certificate desk. No tenant messaging. No rent
              collection. Just documents, dates and reminders.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
                href="/?source=founding-plan#audit"
              >
                Audit then pay £29 <ArrowRight size={18} />
              </a>
              <a
                className="inline-flex min-h-13 items-center rounded-lg border border-[#aeb9a7] px-5 font-black text-[#18220d]"
                href="mailto:hello@letdue.com?subject=LetDue%20founding%20plan%20question"
              >
                Ask a question first
              </a>
            </div>
          </div>
          <aside className="rounded-3xl bg-[#18220d] p-6 text-white">
            <p className="font-black text-[#d9ff73] text-sm uppercase">
              Founding price
            </p>
            <strong className="mt-4 block text-6xl">£29</strong>
            <p className="mt-2 text-[#cbd4c5]">per year, up to 3 properties</p>
            <p className="mt-5 rounded-xl bg-[#26351a] p-4 font-bold text-[#d9ff73]">
              Best when you already know one missed renewal would cost more than
              the whole year.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl leading-tight">What is included</h2>
            <ul className="mt-6 grid gap-3">
              {included.map((item) => (
                <li className="flex gap-3 font-bold" key={item}>
                  <Check className="mt-0.5 text-[#52720d]" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-4xl leading-tight">Good fit if</h2>
            <ul className="mt-6 grid gap-3">
              {goodFit.map((item) => (
                <li className="flex gap-3 font-bold" key={item}>
                  <Check className="mt-0.5 text-[#52720d]" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#d5dbc9] bg-white p-7 md:p-10">
          <ShieldCheck className="text-[#52720d]" size={30} />
          <h2 className="mt-5 text-3xl">Clear limit</h2>
          <p className="mt-3 text-[#526047] leading-7">
            LetDue organises documents, dates and reminders. It does not provide
            legal advice, replace your own checks, or guarantee that a property
            complies with every rule that applies to it.
          </p>
          <a
            className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-[#18220d] px-5 font-black text-white"
            href="/?source=founding-plan#audit"
          >
            Run the audit and choose the paid plan
          </a>
        </div>
      </section>

      <section className="border-[#d5dbc9] border-t bg-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-black text-[#52720d] text-sm uppercase">
            Before you pay
          </p>
          <h2 className="mt-3 text-4xl leading-tight">
            The practical questions first customers ask
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article
                className="rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-5"
                key={item.question}
              >
                <h3 className="text-xl">{item.question}</h3>
                <p className="mt-2 text-[#526047] leading-7">{item.answer}</p>
              </article>
            ))}
          </div>
          <a
            className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
            href="/?source=founding-plan-faq#audit"
          >
            Run the audit and pay £29
          </a>
        </div>
      </section>
    </MarketingFrame>
  );
}
