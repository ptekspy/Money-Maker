import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Service terms — LetDue" };

const sections = [
  {
    title: "What LetDue provides",
    text: "LetDue stores property-certificate information, extracts dates from supported documents, displays a private calendar and sends reminders. Date extraction may be incomplete or wrong, so you must check every date against the original document.",
  },
  {
    title: "Not legal or professional advice",
    text: "LetDue is an organisational tool. It does not inspect a property, issue a certificate, guarantee compliance or replace a qualified professional, council guidance or legal advice. You remain responsible for identifying the rules that apply and completing every required action on time.",
  },
  {
    title: "Free pilot",
    text: "The founding pilot lasts 14 days and monitors up to three properties without a card. We may limit, suspend or end pilot access if the service is abused or creates a security risk. We will explain any paid conversion offer before taking payment.",
  },
  {
    title: "Your account and files",
    text: "Keep the private dashboard link confidential and provide accurate information. Upload only files you are entitled to use and avoid unnecessary tenant or third-party personal information. Tell us promptly if a dashboard link or account may have been compromised.",
  },
  {
    title: "Availability and reminders",
    text: "We aim to keep LetDue available and reminders timely, but internet, supplier and email failures can occur. Do not rely on LetDue as the only record or reminder system. Keep original certificates and an independent record of important dates.",
  },
  {
    title: "Liability",
    text: "Nothing in these terms excludes liability that cannot legally be excluded. Subject to that, LetDue is not responsible for losses caused by an unchecked extracted date, a missed or filtered email, inaccurate information you supplied, or reliance on the service as legal or compliance advice. For a paid account, our total liability relating to the service is limited to the fees paid for that account in the previous 12 months.",
  },
  {
    title: "Ending the service and changes",
    text: "You can ask us to stop reminders or close the account at hello@letdue.com. We may update these terms as the service develops; material changes will be shown on the website or sent to active customers. These terms are governed by the laws of England and Wales, subject to any mandatory consumer rights.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <Link className="font-black text-xl" href="/">
        Let<span className="text-[#52720d]">Due</span>
      </Link>
      <p className="mt-10 font-black text-[#52720d] text-sm uppercase">
        Last updated 15 July 2026
      </p>
      <h1 className="mt-3 text-5xl">Service terms</h1>
      <p className="mt-5 text-[#65715d] leading-7">
        These terms apply to the LetDue website, free pilot and paid monitoring
        service.
      </p>
      <div className="mt-10 grid gap-5">
        {sections.map((section) => (
          <section
            className="rounded-2xl border border-[#d5dbc9] bg-white p-6"
            key={section.title}
          >
            <h2 className="text-2xl">{section.title}</h2>
            <p className="mt-3 text-[#65715d] leading-7">{section.text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
