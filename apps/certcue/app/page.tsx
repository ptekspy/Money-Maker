import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Check,
  ClipboardCheck,
  FileCheck2,
  ScanLine,
} from "lucide-react";
import { ComplianceAudit } from "@/components/compliance-audit";
import { ProductHuntBadge } from "@/components/product-hunt-badge";

const benefits = [
  {
    icon: ScanLine,
    title: "Drop in certificates",
    text: "Upload gas safety, EICR, EPC and the insurance or licence documents you choose to track. LetDue reads the dates for you.",
  },
  {
    icon: FileCheck2,
    title: "See the gaps",
    text: "Every property gets a plain-English action pack: current, expiring, overdue or missing.",
  },
  {
    icon: BellRing,
    title: "Get warned early",
    text: "Useful reminders arrive before the rush: 90, 30, 14 and 7 days ahead, plus the due date.",
  },
];

export default function HomePage() {
  return (
    <>
      <header className="flex min-h-18 items-center justify-between border-[#d5dbc9] border-b bg-[#f4f5ef]/95 px-4 backdrop-blur md:px-8">
        <a className="font-black text-xl tracking-tight" href="#top">
          Let<span className="text-[#52720d]">Due</span>
        </a>
        <nav className="hidden gap-6 font-bold text-[#5e6b55] text-sm md:flex">
          <a href="#how">How it works</a>
          <a href="#tools">Free tools</a>
          <a href="#audit">Free audit</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <a
          className="rounded-lg bg-[#18220d] px-4 py-3 font-black text-white"
          href="#audit"
        >
          Check a property
        </a>
      </header>
      <main id="top">
        <section className="overflow-hidden border-[#d5dbc9] border-b px-4 py-16 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_480px]">
            <div>
              <p className="font-black text-[#52720d] text-sm uppercase">
                England property deadlines, without the spreadsheet
              </p>
              <h1 className="mt-4 max-w-4xl text-6xl leading-[0.92] tracking-[-0.055em] md:text-8xl">
                Know what expires next.
              </h1>
              <p className="mt-6 max-w-2xl text-[#526047] text-xl leading-8">
                LetDue reads your rental-property certificates, builds the
                compliance calendar, and reminds you before an important date
                becomes an expensive problem.
              </p>
              <a
                className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black"
                href="#audit"
              >
                Run a free property audit <ArrowRight size={18} />
              </a>
              <p className="mt-3 text-[#6e7967] text-sm">
                No account · No card · England beta
              </p>
            </div>
            <div className="rounded-3xl bg-[#18220d] p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between border-white/15 border-b pb-4">
                <div>
                  <p className="text-[#aeb9a7] text-sm">12 Ash Grove</p>
                  <strong className="text-2xl">4 documents tracked</strong>
                </div>
                <span className="rounded-full bg-[#fff0bd] px-3 py-1 font-black text-[#684c00] text-xs">
                  1 due soon
                </span>
              </div>
              {[
                ["Gas safety", "23 days"],
                ["EICR", "1 year 9 months"],
                ["EPC", "Current"],
                ["Insurance", "91 days"],
              ].map(([name, due], index) => (
                <div
                  className="flex items-center justify-between border-white/10 border-b py-4"
                  key={name}
                >
                  <span className="font-bold">{name}</span>
                  <span
                    className={
                      index === 0
                        ? "font-black text-[#f5d66c]"
                        : "text-[#b9c4b2]"
                    }
                  >
                    {due}
                  </span>
                </div>
              ))}
              <div className="mt-5 rounded-xl bg-[#26351a] p-4 text-[#d9ff73]">
                <BellRing className="mb-2" size={20} />
                <strong>Next reminder scheduled</strong>
                <p className="mt-1 text-[#cbd8c2] text-sm">
                  Gas safety · 30-day warning
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="how"
          className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-3 md:px-8 md:py-24"
        >
          {benefits.map(({ icon: Icon, title, text }) => (
            <article
              className="rounded-2xl border border-[#d5dbc9] bg-white p-6"
              key={title}
            >
              <Icon className="text-[#52720d]" size={27} />
              <h2 className="mt-5 text-2xl">{title}</h2>
              <p className="mt-2 text-[#65715d] leading-7">{text}</p>
            </article>
          ))}
        </section>
        <section className="border-[#d5dbc9] border-y bg-white px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="font-black text-[#52720d] text-sm uppercase">
                Small-landlord focus
              </p>
              <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
                The useful part of compliance software. Nothing else.
              </h2>
              <p className="mt-4 text-[#526047] text-lg leading-8">
                LetDue is for self-managing landlords with one to three
                properties. It does not collect rent, manage tenants or replace
                your letting agent. It keeps the documents and dates that are
                easy to lose sight of.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                [
                  "Gas safety",
                  "Usually checked every year where the landlord provides gas appliances.",
                  "https://www.hse.gov.uk/gas/landlords/safetycheckswho.htm",
                ],
                [
                  "Electrical safety",
                  "Electrical installations are generally inspected at least every five years in England.",
                  "https://www.gov.uk/government/publications/electrical-safety-standards-in-the-private-and-social-rented-sectors-guidance",
                ],
                [
                  "EPC",
                  "A domestic EPC is normally valid for ten years, unless a newer one is produced.",
                  "https://www.gov.uk/government/publications/energy-performance-certificates-for-the-construction-sale-and-let-of-dwellings",
                ],
                [
                  "Property licensing",
                  "Large HMOs need a licence; councils can require licences for other rented properties too.",
                  "https://www.gov.uk/renting-out-a-property/houses-in-multiple-occupation-hmo",
                ],
              ].map(([title, text, href]) => (
                <a
                  className="group grid gap-1 rounded-xl border border-[#d5dbc9] bg-[#f7f8f3] p-4 transition hover:border-[#8da456] hover:bg-[#f2f7e7]"
                  href={href}
                  key={title}
                  rel="noreferrer"
                  target="_blank"
                >
                  <strong className="text-lg group-hover:text-[#52720d]">
                    {title}
                  </strong>
                  <span className="text-[#65715d] leading-6">{text}</span>
                </a>
              ))}
              <p className="px-1 pt-2 text-[#6e7967] text-sm leading-6">
                Rules vary by property and council. LetDue organises your
                records and reminders; it does not provide legal advice or
                guarantee compliance.
              </p>
            </div>
          </div>
        </section>
        <section
          id="tools"
          className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24"
        >
          <div className="max-w-3xl">
            <p className="font-black text-[#52720d] text-sm uppercase">
              Free landlord tools
            </p>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
              Work out the date. Then stop relying on memory.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: CalendarClock,
                title: "Gas safety expiry calculator",
                text: "Turn the date on your gas safety record into a five-stage reminder schedule.",
                href: "/tools/gas-safety-certificate-expiry-calculator",
              },
              {
                icon: CalendarClock,
                title: "EICR renewal calculator",
                text: "See when to start acting before the next inspection date on your electrical report.",
                href: "/tools/eicr-renewal-calculator",
              },
              {
                icon: ClipboardCheck,
                title: "England landlord checklist",
                text: "A plain-English starting list of the evidence and recurring dates worth organising.",
                href: "/guides/landlord-compliance-checklist-england",
              },
            ].map(({ icon: Icon, title, text, href }) => (
              <a
                className="group rounded-2xl border border-[#d5dbc9] bg-white p-6 transition hover:-translate-y-1 hover:border-[#8da456] hover:shadow-lg"
                href={href}
                key={title}
              >
                <Icon className="text-[#52720d]" size={27} />
                <h3 className="mt-5 text-2xl group-hover:text-[#52720d]">
                  {title}
                </h3>
                <p className="mt-2 text-[#65715d] leading-7">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-black">
                  Use free tool <ArrowRight size={17} />
                </span>
              </a>
            ))}
          </div>
        </section>
        <ComplianceAudit />
        <section
          id="pricing"
          className="bg-[#18220d] px-4 py-16 text-white md:px-8 md:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="font-black text-[#d9ff73] text-sm uppercase">
                Founding plan
              </p>
              <h2 className="mt-3 text-5xl md:text-7xl">
                One avoided deadline pays for years.
              </h2>
              <p className="mt-5 max-w-2xl text-[#cbd4c5] text-lg leading-8">
                Monitor up to three properties, store every certificate, and
                receive every reminder for £29 a year while the founding plan is
                available.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-[#18220d]">
              <strong className="text-5xl">£29</strong>
              <span className="font-bold text-[#65715d]"> / year</span>
              <ul className="mt-6 grid gap-3">
                {[
                  "Up to 3 properties",
                  "Automatic certificate date reading",
                  "Email reminders at five useful intervals",
                  "Downloadable compliance pack",
                  "Cancel any time",
                ].map((item) => (
                  <li className="flex gap-2 font-bold" key={item}>
                    <Check className="text-[#52720d]" size={19} />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#d9ff73] px-4 font-black"
                href="#audit"
              >
                Audit your first property
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-wrap justify-between gap-4 border-[#d5dbc9] border-t px-4 py-7 font-bold text-[#687260] text-sm md:px-8">
        <span className="text-[#18220d]">LetDue</span>
        <span>Compliance information, not legal advice · England beta</span>
        <span className="flex gap-4">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </span>
        <a href="mailto:hello@letdue.com">hello@letdue.com</a>
        <ProductHuntBadge />
      </footer>
    </>
  );
}
