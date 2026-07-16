import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy notice — LetDue" };

const sections = [
  {
    title: "Who controls your information",
    text: "LetDue is operated by Patrick Kenneally in the United Kingdom. For privacy questions or requests, email hello@letdue.com.",
  },
  {
    title: "Information we collect",
    text: "We collect the email address, property details, certificate dates and certificate files you choose to provide. We also receive limited technical and security logs needed to operate and protect the service. We do not need tenant names, identity documents or payment-card details in certificate uploads, and you should remove those where they are not required.",
  },
  {
    title: "Why we use it",
    text: "We use this information to provide the requested audit, private dashboard, document storage and deadline reminders; support the account; secure the service; and meet legal or accounting obligations. Our main lawful bases are performing the service contract and our legitimate interests in operating and protecting LetDue. Where the law requires consent, we will ask for it separately.",
  },
  {
    title: "Who processes it",
    text: "Amazon Web Services hosts the application, database, encrypted files and transactional email. Cloudflare provides domain and email-routing services. Stripe will process subscription payments when paid billing is enabled; LetDue does not store full card details. We disclose information only where needed to run the service, comply with law or protect legal rights.",
  },
  {
    title: "Storage and retention",
    text: "Customer files are stored in encrypted Amazon S3 and account data in Amazon DynamoDB. We normally keep account information while monitoring is active. After a pilot or account ends, we may retain it for up to 90 days to allow recovery or resolve support and security issues, then delete or anonymise it unless a longer period is legally required. Payment and tax records may be retained for the period required by UK law.",
  },
  {
    title: "Your choices and rights",
    text: "You can ask us for access, correction, deletion, restriction, objection or portability where the relevant right applies. You can stop reminders and close the account by emailing hello@letdue.com. You may also complain to the UK Information Commissioner’s Office. We would appreciate the opportunity to resolve the issue first.",
  },
  {
    title: "Automated processing and transfers",
    text: "LetDue reads dates from uploaded documents and calculates reminder timing, but it does not make legal or similarly significant decisions about you. Some suppliers may process information outside the UK under their contractual and legal transfer safeguards.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <Link className="font-black text-xl" href="/">
        Let<span className="text-[#52720d]">Due</span>
      </Link>
      <p className="mt-10 font-black text-[#52720d] text-sm uppercase">
        Last updated 15 July 2026
      </p>
      <h1 className="mt-3 text-5xl">Privacy notice</h1>
      <p className="mt-5 text-[#65715d] leading-7">
        This notice explains how LetDue handles personal information when you
        use the website, free pilot or paid monitoring service.
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
