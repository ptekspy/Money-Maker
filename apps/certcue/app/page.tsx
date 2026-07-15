import {
  ArrowRight,
  BellRing,
  Check,
  FileCheck2,
  ScanLine,
} from "lucide-react";
import { ComplianceAudit } from "@/components/compliance-audit";

const benefits = [
  {
    icon: ScanLine,
    title: "Drop in certificates",
    text: "Upload gas safety, EICR, EPC, insurance and licence documents. LetDue reads the dates for you.",
  },
  {
    icon: FileCheck2,
    title: "See the gaps",
    text: "Every property gets a plain-English action pack: current, expiring, overdue or missing.",
  },
  {
    icon: BellRing,
    title: "Get warned early",
    text: "Useful reminders arrive before the rush: 90, 30, 14 and 7 days ahead of the deadline.",
  },
];

export default function HomePage() {
  return (
    <>
      <header className="flex min-h-18 items-center justify-between border-[#d5dbc9] border-b bg-[#f4f5ef]/95 px-4 backdrop-blur md:px-8">
        <a className="font-black text-xl tracking-tight" href="#top">
          Cert<span className="text-[#52720d]">Cue</span>
        </a>
        <nav className="hidden gap-6 font-bold text-[#5e6b55] text-sm md:flex">
          <a href="#how">How it works</a>
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
                UK property compliance, without the spreadsheet
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
                receive every reminder for £29 a year.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-[#18220d]">
              <strong className="text-5xl">£29</strong>
              <span className="font-bold text-[#65715d]"> / year</span>
              <ul className="mt-6 grid gap-3">
                {[
                  "Up to 3 properties",
                  "Automatic certificate date reading",
                  "Email reminders at four intervals",
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
        <a href="mailto:hello@letdue.co.uk">hello@letdue.co.uk</a>
      </footer>
    </>
  );
}
