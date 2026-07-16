"use client";

import { Check, Copy, Download, LockKeyhole, Upload } from "lucide-react";
import { useMemo, useState } from "react";

type RawLead = {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  status?: string;
  source?: string;
  date?: string;
  value?: string;
  notes?: string;
};

type Lead = RawLead & {
  id: string;
  score: number;
  priority: "Hot" | "Warm" | "Review" | "Ignore";
  draft: string;
};

const sampleLeads: RawLead[] = [
  {
    name: "Sarah Jenkins",
    phone: "07700 900144",
    email: "sarah@example.com",
    service: "Roof leak inspection",
    status: "Quote sent",
    source: "Website form",
    date: "2026-06-19",
    value: "1800",
    notes: "Asked about a leak after heavy rain. Quote sent with no reply.",
  },
  {
    name: "Mike Alvarez",
    phone: "07700 900129",
    email: "mike@example.com",
    service: "Gutter and flashing repair",
    status: "Missed call",
    source: "Google Business Profile",
    date: "2026-07-04",
    value: "650",
    notes: "Called twice after heavy rain. No voicemail left.",
  },
  {
    name: "Priya Shah",
    phone: "07700 900168",
    email: "priya@example.com",
    service: "Full re-roof quote",
    status: "Estimate requested",
    source: "Checkatrade",
    date: "2026-05-28",
    value: "8500",
    notes: "Wanted a quote before choosing repair or replacement.",
  },
  {
    name: "Daniel Brooks",
    phone: "07700 900177",
    email: "daniel@example.com",
    service: "Skylight leak",
    status: "Booked",
    source: "Phone",
    date: "2026-07-08",
    value: "900",
    notes: "Already booked for Friday.",
  },
  {
    name: "Angela Martin",
    phone: "07700 900188",
    email: "angela@example.com",
    service: "Damp patch and roof inspection",
    status: "Ghosted",
    source: "MyBuilder",
    date: "2026-06-02",
    value: "2200",
    notes: "Damp patches on the bedroom ceiling; wanted a second opinion.",
  },
];

function parseCsv(text: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const headerRow = rows.shift();
  if (!headerRow) return [];
  const headers = headerRow.map((header) => header.toLowerCase().trim());
  return rows.map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ),
  );
}

function daysSince(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 999;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 86_400_000));
}

function scoreLead(lead: RawLead) {
  const status = (lead.status ?? "").toLowerCase();
  const notes = (lead.notes ?? "").toLowerCase();
  const value = Number.parseFloat(lead.value ?? "0") || 0;
  const age = daysSince(lead.date ?? "");
  let score = 20;

  if (status.includes("quote")) score += 30;
  if (status.includes("ghost")) score += 25;
  if (status.includes("missed")) score += 25;
  if (status.includes("estimate")) score += 22;
  if (
    ["booked", "won", "lost", "declined", "do not contact"].some((word) =>
      status.includes(word),
    )
  )
    score -= 60;
  if (
    ["leak", "storm", "urgent", "insurance"].some((word) =>
      notes.includes(word),
    )
  )
    score += 12;
  if (value >= 8000) score += 18;
  else if (value >= 3000) score += 10;
  if (age <= 14) score += 14;
  else if (age > 90) score -= 18;
  else if (age > 60) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function priorityFor(score: number): Lead["priority"] {
  if (score >= 72) return "Hot";
  if (score >= 45) return "Warm";
  if (score >= 20) return "Review";
  return "Ignore";
}

function makeDraft(lead: RawLead, businessName: string) {
  const firstName = (lead.name || "there").split(" ")[0];
  const service = lead.service || "the work you asked about";
  const status = (lead.status || "").toLowerCase();
  if (status.includes("missed")) {
    return `Hi ${firstName}, it's ${businessName}. Sorry we missed your call about ${service}. Do you still need a hand with it?`;
  }
  if (status.includes("quote") || status.includes("estimate")) {
    return `Hi ${firstName}, it's ${businessName}. Just checking whether you still wanted help with ${service}. No pressure either way — would you like us to keep the quote open?`;
  }
  return `Hi ${firstName}, it's ${businessName}. Just following up about ${service}. Do you still want us to take a look, or should we close this out?`;
}

function hydrate(rawLeads: RawLead[], businessName: string): Lead[] {
  return rawLeads.slice(0, 500).map((lead, index) => {
    const score = scoreLead(lead);
    return {
      ...lead,
      id: `${index}-${lead.email || lead.phone || lead.name || "lead"}`,
      score,
      priority: priorityFor(score),
      draft: makeDraft(lead, businessName),
    };
  });
}

function money(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function RecoveryScanner() {
  const [businessName, setBusinessName] = useState("Your business");
  const [sourceLeads, setSourceLeads] = useState<RawLead[]>([]);
  const [fileName, setFileName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const leads = useMemo(
    () => hydrate(sourceLeads, businessName || "Your business"),
    [sourceLeads, businessName],
  );
  const targets = leads.filter(
    (lead) => lead.priority === "Hot" || lead.priority === "Warm",
  );
  const pipeline = targets.reduce(
    (sum, lead) => sum + (Number.parseFloat(lead.value || "0") || 0),
    0,
  );
  const checkoutUrl = process.env.NEXT_PUBLIC_RECOVERY_SPRINT_URL;
  const orderHref =
    checkoutUrl ||
    `mailto:scan@quotewinback.co.uk?subject=${encodeURIComponent("Book a £149 Recovery Sprint")}&body=${encodeURIComponent(`Hi QuoteWinBack,\n\nI'd like to book a Recovery Sprint. My scan found ${targets.length} recovery targets with ${money(pipeline)} in potential pipeline.\n\nBusiness: ${businessName}\nFile: ${fileName || "Not supplied"}\n`)}`;

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.length)
        throw new Error("No lead rows were found in that file.");
      setSourceLeads(parsed);
      setFileName(file.name);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "That file could not be read.",
      );
    }
  }

  async function copyDraft(lead: Lead) {
    await navigator.clipboard.writeText(lead.draft);
    setCopiedId(lead.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  }

  function exportQueue() {
    const headers = [
      "name",
      "phone",
      "email",
      "service",
      "status",
      "date",
      "value",
      "score",
      "priority",
      "draft",
    ] as const;
    const rows = leads.map((lead) =>
      headers.map((header) => csvCell(lead[header] ?? "")).join(","),
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quotewinback-recovery-queue.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <section className="bg-[#102820] px-4 py-12 text-white md:px-8 md:py-18">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 font-extrabold text-[#f2b84b] text-sm uppercase">
            Free private scan
          </p>
          <h1 className="max-w-4xl text-5xl leading-[0.98] md:text-7xl">
            See which old quotes are still worth chasing.
          </h1>
          <p className="mt-5 max-w-2xl text-[#eaf1ee] text-lg leading-8">
            Upload a CSV. QuoteWinBack ranks the opportunities, totals the
            potential pipeline, and writes a polite follow-up for each one.
          </p>
          <div className="mt-5 flex items-center gap-2 font-bold text-[#bcd0c8] text-sm">
            <LockKeyhole size={17} /> Your file stays on this device. It is
            never uploaded.
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 md:px-8">
        <div className="grid gap-4 rounded-xl border border-[#d8e2de] bg-white p-5 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 font-extrabold">
            Business name
            <input
              className="min-h-12 rounded-md border border-[#b9c7c1] px-3 font-normal"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#102820] px-4 font-extrabold text-white">
              <Upload size={18} /> Upload CSV
              <input
                className="sr-only"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
            <button
              className="min-h-12 rounded-md border border-[#b9c7c1] px-4 font-extrabold"
              type="button"
              onClick={() => {
                setSourceLeads(sampleLeads);
                setFileName("sample-roofing-enquiries.csv");
              }}
            >
              Try sample data
            </button>
          </div>
          <p className="text-[#5d6c67] text-sm md:col-span-2">
            Columns: name, phone, email, service, status, source, date, value,
            notes. Up to 500 rows.
          </p>
          {error ? (
            <p className="font-bold text-[#9a321f] md:col-span-2" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        {leads.length ? (
          <>
            <section
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              aria-label="Recovery scan summary"
            >
              {[
                ["Enquiries scanned", leads.length],
                ["Recovery targets", targets.length],
                ["Potential pipeline", money(pipeline)],
                ["Drafts ready", targets.length],
              ].map(([label, value]) => (
                <article
                  className="rounded-xl border border-[#d8e2de] bg-white p-5"
                  key={label}
                >
                  <p className="font-bold text-[#5d6c67] text-sm">{label}</p>
                  <strong className="mt-2 block text-3xl">{value}</strong>
                </article>
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
              <div className="overflow-hidden rounded-xl border border-[#d8e2de] bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-[#d8e2de] border-b p-5">
                  <div>
                    <h2 className="text-2xl">Recovery queue</h2>
                    <p className="mt-1 text-[#5d6c67]">
                      Highest-priority opportunities first.
                    </p>
                  </div>
                  <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#b9c7c1] px-3 font-extrabold"
                    type="button"
                    onClick={exportQueue}
                  >
                    <Download size={17} /> Export
                  </button>
                </div>
                <div className="divide-y divide-[#e4eae7]">
                  {[...leads]
                    .sort((a, b) => b.score - a.score)
                    .map((lead) => (
                      <article className="grid gap-4 p-5" key={lead.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold text-xl">
                              {lead.name || "Unnamed enquiry"}
                            </h3>
                            <p className="mt-1 text-[#5d6c67]">
                              {lead.service || "Service not supplied"} ·{" "}
                              {lead.status || "No status"} ·{" "}
                              {lead.date || "No date"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 font-extrabold text-xs uppercase ${lead.priority === "Hot" ? "bg-[#ffe0d6] text-[#8a270f]" : lead.priority === "Warm" ? "bg-[#fff1c7] text-[#6d4b00]" : "bg-[#e3e8ef] text-[#354154]"}`}
                          >
                            {lead.priority} · {lead.score}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[#eef6f2] p-4 text-[#24483d] leading-7">
                          {lead.draft}
                        </div>
                        <button
                          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-[#b9c7c1] px-3 font-extrabold"
                          type="button"
                          onClick={() => copyDraft(lead)}
                        >
                          {copiedId === lead.id ? (
                            <Check size={17} />
                          ) : (
                            <Copy size={17} />
                          )}
                          {copiedId === lead.id ? "Copied" : "Copy message"}
                        </button>
                      </article>
                    ))}
                </div>
              </div>

              <aside className="h-fit rounded-xl bg-[#102820] p-6 text-white lg:sticky lg:top-24">
                <p className="font-extrabold text-[#f2b84b] text-sm uppercase">
                  Launch offer
                </p>
                <h2 className="mt-2 text-3xl">Recovery Sprint</h2>
                <p className="mt-3 text-[#dce6e1] leading-7">
                  We manually review up to 100 enquiries, improve every message,
                  and give you a send-ready priority queue.
                </p>
                <strong className="mt-5 block text-4xl">£149</strong>
                <ul className="mt-5 grid gap-3 text-sm">
                  {[
                    "Human-reviewed opportunity scoring",
                    "Messages tailored to each enquiry",
                    "Send-ready CSV and action plan",
                    "Fewer than 5 warm leads? No charge",
                  ].map((item) => (
                    <li className="flex gap-2" key={item}>
                      <Check
                        className="mt-0.5 shrink-0 text-[#f2b84b]"
                        size={17}
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-white px-4 text-center font-extrabold text-[#102820]"
                  href={orderHref}
                >
                  Book the £149 sprint
                </a>
                {!checkoutUrl ? (
                  <p className="mt-3 text-center text-[#bcd0c8] text-xs">
                    Orders currently confirmed by email.
                  </p>
                ) : null}
              </aside>
            </section>
          </>
        ) : (
          <section className="grid min-h-64 place-items-center rounded-xl border border-[#c8d3ce] border-dashed bg-white p-8 text-center">
            <div>
              <Upload className="mx-auto text-[#176b4f]" size={34} />
              <h2 className="mt-3 text-2xl">Your results will appear here</h2>
              <p className="mt-2 text-[#5d6c67]">
                Use sample data if you want to see the full scan before using
                your own file.
              </p>
            </div>
          </section>
        )}
      </section>
    </>
  );
}
