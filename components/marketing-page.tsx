import Image from "next/image";
import Link from "next/link";
import {
  genericSources,
  mailtoHref,
  type ProfessionLanding,
} from "@/lib/landing-data";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type MarketingPageProps = {
  landing?: ProfessionLanding;
};

const defaultRows: [string, "Hot" | "Warm" | "Review"][] = [
  ["Old quote", "Hot"],
  ["Website enquiry", "Warm"],
  ["Paid lead", "Review"],
];

function statusClass(status: "Hot" | "Warm" | "Review") {
  if (status === "Hot") return "bg-[#ffe0d6] text-[#8a270f]";
  if (status === "Warm") return "bg-[#fff1c7] text-[#6d4b00]";
  return "bg-[#e3e8ef] text-[#354154]";
}

export function MarketingPage({ landing }: MarketingPageProps) {
  const localLanding = landing ?? null;
  const isLocal = localLanding !== null;
  const audience = localLanding?.audience ?? "trade businesses";
  const headline = localLanding
    ? `Recover old quotes for ${localLanding.area} ${localLanding.profession.toLowerCase()}.`
    : "Recover old quotes before they go cold.";
  const intro = localLanding
    ? `QuoteWinBack helps ${audience} find missed enquiries, stale quotes, and paid leads that never got a proper follow-up.`
    : "QuoteWinBack finds missed enquiries, stale quotes, and paid leads that never got a proper follow-up, then turns them into an approved recovery queue.";
  const rows = localLanding?.exampleRows ?? defaultRows;
  const sources = localLanding?.enquirySources ?? genericSources;
  const pipeline = localLanding?.pipelineValue ?? "GBP 18,650";
  const subject = localLanding
    ? `${localLanding.area} ${localLanding.profession} recovery scan request`
    : "QuoteWinBack recovery scan request";

  return (
    <>
      <a
        className="absolute left-4 top-3 z-50 -translate-y-36 rounded-md border-2 border-[#f2b84b] bg-white px-3 py-2 font-extrabold text-[#102820] focus:translate-y-0"
        href="#main"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main">
        <section
          aria-label="QuoteWinBack recovery overview"
          className="relative flex flex-col gap-7 overflow-hidden bg-[#102820] px-4 py-11 md:grid md:min-h-[calc(100svh-72px)] md:items-center md:px-8 md:py-20"
        >
          <div className="relative z-[2] max-w-[760px] text-white">
            <p className="mb-3 font-extrabold text-[#f2b84b] text-sm uppercase">
              {isLocal
                ? `For ${audience}`
                : "For UK trades and local service firms"}
            </p>
            <h1 className="mb-5 max-w-[720px] text-5xl leading-[0.95] tracking-normal md:text-7xl lg:text-[88px]">
              {headline}
            </h1>
            <p className="max-w-[630px] text-[#eaf1ee] text-lg leading-8 md:text-xl">
              {intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-white px-4 font-extrabold text-[#102820] md:w-auto"
                href={mailtoHref(subject)}
              >
                Start a recovery scan
              </a>
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#d8e2de] bg-white px-4 font-extrabold text-[#102820] md:w-auto"
                href="#pilot"
              >
                See the pilot offer
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative z-[1] flex w-full justify-center md:absolute md:inset-0 md:items-center md:justify-end md:px-[6vw] md:py-24"
          >
            <div className="w-full max-w-[460px] rounded-lg border border-white/50 bg-white/90 p-5 shadow-2xl md:w-[min(520px,46vw)] md:max-w-none md:-rotate-2 md:p-6">
              <div className="mb-4 flex items-center justify-between rounded-md bg-[#102820] p-4 text-white">
                <span className="font-bold">Recovery queue</span>
                <strong className="text-[#f2b84b] text-2xl">{pipeline}</strong>
              </div>
              {rows.map(([label, status]) => (
                <div
                  className="mb-3 flex min-h-14 items-center justify-between rounded-md bg-[#f5f7f8] px-4 text-[#102820]"
                  key={label}
                >
                  <span className="font-bold">{label}</span>
                  <b
                    className={`rounded-full px-2.5 py-1.5 text-xs uppercase ${statusClass(status)}`}
                  >
                    {status}
                  </b>
                </div>
              ))}
              <div className="mt-4 rounded-md bg-[#eef6f2] p-4 font-bold text-[#24483d] leading-6">
                Hi Sarah, just checking if you still wanted help with the
                quote...
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-[#d8e2de] border-b bg-white px-4 py-5 md:px-8"
          aria-label="Common lost enquiry sources"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2.5">
            {sources.map((source) => (
              <span
                className="rounded-full border border-[#d8e2de] bg-[#f5f7f8] px-3 py-2 font-extrabold text-[#5d6c67] text-sm"
                key={source}
              >
                {source}
              </span>
            ))}
          </div>
        </section>

        <section id="how" className="px-4 py-14 md:px-8 md:py-20">
          <div className="mx-auto mb-8 max-w-[850px] text-center">
            <p className="mb-3 font-extrabold text-[#176b4f] text-sm uppercase">
              How it works
            </p>
            <h2 className="text-4xl leading-tight md:text-6xl">
              Your old enquiries become a clean recovery queue.
            </h2>
          </div>
          <div className="mx-auto grid max-w-6xl gap-3.5 md:grid-cols-3">
            {[
              [
                "1",
                "Send old enquiries",
                "Spreadsheet, screenshots, CRM export, inbox messages, or marketplace leads from the last 60-90 days.",
              ],
              [
                "2",
                "We find the warm ones",
                "Each quote or enquiry is sorted into hot, warm, review, or ignore based on follow-up potential.",
              ],
              [
                "3",
                "You approve follow-ups",
                "Nothing goes out blind. You review the queue, approve drafts, and track replies and booked work.",
              ],
            ].map(([step, title, text]) => (
              <article
                className="rounded-lg border border-[#d8e2de] bg-white p-6"
                key={step}
              >
                <span className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f2b84b] font-black">
                  {step}
                </span>
                <h3 className="mb-2 font-extrabold text-2xl">{title}</h3>
                <p className="text-[#5d6c67] leading-7">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="proof"
          className="border-[#d8e2de] border-y bg-white px-4 py-14 md:px-8 md:py-20"
        >
          <div className="mx-auto mb-8 max-w-[850px] text-center">
            <p className="mb-3 font-extrabold text-[#176b4f] text-sm uppercase">
              What you get
            </p>
            <h2 className="text-4xl leading-tight md:text-6xl">
              A practical scan of money already sitting in your pipeline.
            </h2>
          </div>
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_minmax(280px,420px)]">
            <div className="grid gap-3">
              {(
                localLanding?.proofPoints ?? [
                  "Total value of quotes and enquiries worth chasing.",
                  "Plain-English messages written for each warm lead.",
                  "Replies, booked appointments, lost reasons, and next actions.",
                ]
              ).map((point, index) => (
                <div
                  className="rounded-lg border border-[#d8e2de] bg-[#f5f7f8] p-6"
                  key={point}
                >
                  <h3 className="mb-2 font-extrabold text-2xl">
                    {[
                      "Recoverable pipeline",
                      "Follow-up drafts",
                      "Outcome tracking",
                    ][index] ?? "Recovery signal"}
                  </h3>
                  <p className="text-[#5d6c67] leading-7">{point}</p>
                </div>
              ))}
            </div>
            <figure className="m-0 grid content-center gap-5 rounded-lg bg-[#102820] p-6 text-white">
              <Image
                src="/logo.svg"
                width={640}
                height={180}
                alt="QuoteWinBack logo"
                className="w-full max-w-[340px] rounded-lg bg-white"
              />
              <figcaption className="grid gap-2">
                <strong className="text-2xl">Example scan</strong>
                <span className="text-[#dce6e1]">42 enquiries reviewed</span>
                <span className="text-[#dce6e1]">11 warm opportunities</span>
                <span className="text-[#dce6e1]">
                  {pipeline} estimated pipeline
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section
          id="pilot"
          className="mx-auto grid max-w-6xl items-center gap-7 px-4 py-14 md:grid-cols-[1fr_280px] md:px-8 md:py-20"
        >
          <div className="max-w-[760px]">
            <p className="mb-3 font-extrabold text-[#176b4f] text-sm uppercase">
              Pilot offer
            </p>
            <h2 className="mb-4 text-4xl leading-tight md:text-6xl">
              If there are not at least 5 warm opportunities, there is no
              charge.
            </h2>
            <p className="text-[#5d6c67] leading-7">
              Send the last 60-90 days of unclosed quotes, missed enquiries, and
              paid leads. We show what is worth following up before you pay for
              a monthly service.
            </p>
          </div>
          <div className="grid justify-items-start gap-3">
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#102820] px-4 font-extrabold text-white"
              href={mailtoHref(subject)}
            >
              Start a scan
            </a>
            <p className="font-bold text-[#5d6c67]">
              {localLanding?.area ?? "Built from Bradford, West Yorkshire"}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
