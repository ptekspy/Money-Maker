"use client";

import {
  AlertTriangle,
  BellRing,
  FileSearch,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { startPilot } from "@/app/actions/pilot";
import {
  assessCertificate,
  type CertificateKind,
  recommendedCertificates,
} from "@/lib/compliance";

const certificateKinds: CertificateKind[] = [
  "Gas safety",
  "EICR",
  "EPC",
  "Landlord insurance",
  "Property licence",
];

function statusClass(status: string) {
  if (status === "Current") return "bg-[#dff5d8] text-[#26531b]";
  if (status === "Due soon") return "bg-[#fff0bd] text-[#684c00]";
  return "bg-[#ffe0d9] text-[#7a2514]";
}

function displayDueDate(expiry: string) {
  if (!expiry) return "Date needed";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(`${expiry}T12:00:00`),
  );
}

export function ComplianceAudit() {
  const [address, setAddress] = useState("");
  const [hasGas, setHasGas] = useState(true);
  const [isHmo, setIsHmo] = useState(false);
  const [dates, setDates] = useState<Record<CertificateKind, string>>({
    "Gas safety": "",
    EICR: "",
    EPC: "",
    "Landlord insurance": "",
    "Property licence": "",
  });
  const [audited, setAudited] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState("");
  const [source, setSource] = useState("homepage");

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("source");
    if (candidate && /^[a-z0-9-]{1,64}$/.test(candidate)) setSource(candidate);
  }, []);

  const required = useMemo(
    () => recommendedCertificates(hasGas, isHmo),
    [hasGas, isHmo],
  );
  const results = required.map((kind) =>
    assessCertificate({ kind, expiry: dates[kind] }),
  );
  const attention = results.filter(
    (item) => item.status === "Overdue" || item.status === "Due soon",
  ).length;

  function loadExample() {
    const now = new Date();
    const inDays = (days: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0, 10);
    };
    setAddress("18 Meadow Lane, Leeds");
    setHasGas(true);
    setIsHmo(false);
    setDates({
      "Gas safety": inDays(23),
      EICR: inDays(640),
      EPC: inDays(-12),
      "Landlord insurance": inDays(91),
      "Property licence": "",
    });
    setAudited(true);
  }

  async function readCertificate(file?: File) {
    if (!file) return;
    setExtracting(true);
    setExtractionMessage("");
    try {
      const body = new FormData();
      body.set("certificate", file);
      const response = await fetch("/api/extract-certificate", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as {
        error?: string;
        kind?: CertificateKind | null;
        expiry?: string | null;
        confidence?: string;
      };
      if (!response.ok || !result.kind || !result.expiry) {
        throw new Error(
          result.error ??
            "We could not confidently find the certificate and expiry date.",
        );
      }
      setDates((current) => ({
        ...current,
        [result.kind as CertificateKind]: result.expiry ?? "",
      }));
      setExtractionMessage(
        `${result.kind} date found: ${displayDueDate(result.expiry)}. Please check it before continuing.`,
      );
    } catch (error) {
      setExtractionMessage(
        error instanceof Error
          ? error.message
          : "That certificate could not be read.",
      );
    } finally {
      setExtracting(false);
    }
  }

  return (
    <section
      id="audit"
      className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mb-9 max-w-3xl">
        <p className="font-black text-[#52720d] text-sm uppercase">
          Free property audit
        </p>
        <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
          Find the deadline most likely to catch you out.
        </h2>
        <p className="mt-4 text-[#526047] text-lg leading-8">
          No account needed. Upload one PDF or enter the dates you know; LetDue
          turns them into a clear action list.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
        <form
          className="grid h-fit gap-4 rounded-2xl border border-[#d5dbc9] bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setAudited(true);
          }}
        >
          <label className="grid gap-2 font-bold">
            Property address
            <input
              className="min-h-12 rounded-lg border border-[#bcc7ae] px-3 font-normal"
              placeholder="e.g. 18 Meadow Lane, Leeds"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-h-14 items-center gap-3 rounded-lg border border-[#d5dbc9] p-3 font-bold">
              <input
                checked={hasGas}
                onChange={(event) => setHasGas(event.target.checked)}
                type="checkbox"
              />{" "}
              Gas supply
            </label>
            <label className="flex min-h-14 items-center gap-3 rounded-lg border border-[#d5dbc9] p-3 font-bold">
              <input
                checked={isHmo}
                onChange={(event) => setIsHmo(event.target.checked)}
                type="checkbox"
              />{" "}
              Licence to track
            </label>
          </div>
          <label className="grid cursor-pointer gap-2 rounded-lg border border-[#b8c4aa] border-dashed bg-[#f7f8f3] p-4 text-center font-black">
            <span className="flex items-center justify-center gap-2">
              {extracting ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Upload size={18} />
              )}
              {extracting ? "Reading certificateâ€¦" : "Read a certificate PDF"}
            </span>
            <input
              className="sr-only"
              type="file"
              accept="application/pdf,.pdf"
              disabled={extracting}
              onChange={(event) => readCertificate(event.target.files?.[0])}
            />
          </label>
          {extractionMessage ? (
            <p className="rounded-lg bg-[#edf2e6] p-3 text-[#4f5d46] text-sm leading-6">
              {extractionMessage}
            </p>
          ) : null}
          <div className="grid gap-3 border-[#dfe4d7] border-t pt-4">
            {certificateKinds
              .filter((kind) => required.includes(kind))
              .map((kind) => (
                <label
                  className="grid grid-cols-[1fr_150px] items-center gap-3 font-bold text-sm"
                  key={kind}
                >
                  <span>{kind} expiry</span>
                  <input
                    className="min-h-11 rounded-lg border border-[#bcc7ae] px-2 font-normal"
                    type="date"
                    value={dates[kind]}
                    onChange={(event) =>
                      setDates((current) => ({
                        ...current,
                        [kind]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
          </div>
          <button
            className="min-h-12 rounded-lg bg-[#18220d] px-4 font-black text-white"
            type="submit"
          >
            Run compliance audit
          </button>
          <button
            className="min-h-11 rounded-lg border border-[#bcc7ae] px-4 font-bold"
            type="button"
            onClick={loadExample}
          >
            Try an example property
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-[#d5dbc9] bg-white">
          {!audited ? (
            <div className="grid min-h-[520px] place-items-center p-8 text-center">
              <div>
                <FileSearch className="mx-auto text-[#52720d]" size={44} />
                <h3 className="mt-4 text-2xl">
                  Your property action pack appears here
                </h3>
                <p className="mx-auto mt-2 max-w-md text-[#65715d] leading-7">
                  We will show what is missing, what expires next, and the dates
                  worth putting on watch.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#18220d] p-6 text-white">
                <div>
                  <p className="font-bold text-[#d9ff73] text-sm uppercase">
                    Property status
                  </p>
                  <h3 className="mt-1 text-2xl">
                    {address || "Untitled property"}
                  </h3>
                </div>
                <div className="text-right">
                  <strong className="block text-4xl">{attention}</strong>
                  <span className="text-[#d8dfd0] text-sm">
                    dated items need attention
                  </span>
                </div>
              </div>
              <div className="divide-y divide-[#e2e7db]">
                {results.map((item) => (
                  <article
                    className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
                    key={item.kind}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-lg">{item.kind}</h4>
                        <span
                          className={`rounded-full px-2.5 py-1 font-black text-xs ${statusClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[#65715d]">
                        {displayDueDate(item.expiry)}
                        {item.daysLeft !== null
                          ? ` Â· ${Math.abs(item.daysLeft)} days ${item.daysLeft < 0 ? "overdue" : "remaining"}`
                          : ""}
                      </p>
                    </div>
                    {item.status === "Current" ? (
                      <ShieldCheck className="text-[#477118]" />
                    ) : (
                      <AlertTriangle className="text-[#ad4f22]" />
                    )}
                  </article>
                ))}
              </div>
              <div className="border-[#d5dbc9] border-t bg-[#f7f8f3] p-6">
                <div className="flex gap-3">
                  <BellRing className="mt-1 shrink-0 text-[#52720d]" />
                  <div>
                    <h4 className="font-black text-xl">
                      Put this property on autopilot
                    </h4>
                    <p className="mt-1 text-[#65715d] leading-7">
                      Upload certificates instead of typing dates. LetDue reads
                      them, stores the evidence, and reminds you at 90, 30, 14,
                      7 and 0 days.
                    </p>
                  </div>
                </div>
                <form action={startPilot} className="mt-5 grid gap-3">
                  <label className="grid gap-1 font-bold text-sm">
                    Reminder email
                    <input
                      className="min-h-11 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                      name="email"
                      type="email"
                      required
                    />
                  </label>
                  <input name="address" type="hidden" value={address} />
                  <input name="source" type="hidden" value={source} />
                  <input
                    aria-hidden="true"
                    className="hidden"
                    name="companyWebsite"
                    tabIndex={-1}
                    type="text"
                  />
                  <input name="hasGas" type="hidden" value={String(hasGas)} />
                  <input name="isHmo" type="hidden" value={String(isHmo)} />
                  <input
                    name="gasSafety"
                    type="hidden"
                    value={dates["Gas safety"]}
                  />
                  <input name="eicr" type="hidden" value={dates.EICR} />
                  <input name="epc" type="hidden" value={dates.EPC} />
                  <input
                    name="insurance"
                    type="hidden"
                    value={dates["Landlord insurance"]}
                  />
                  <input
                    name="propertyLicence"
                    type="hidden"
                    value={dates["Property licence"]}
                  />
                  <button
                    className="min-h-12 rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
                    type="submit"
                  >
                    Start free 14-day pilot â€” no card
                  </button>
                  <p className="text-center text-[#65715d] text-xs">
                    One property now; add up to two more in your private
                    dashboard. The founding plan will be Â£29/year after the
                    pilot.
                  </p>
                  <p className="text-center text-[#65715d] text-xs leading-5">
                    By starting the pilot, you agree to the{" "}
                    <a className="underline" href="/terms">
                      terms
                    </a>{" "}
                    and acknowledge the{" "}
                    <a className="underline" href="/privacy">
                      privacy notice
                    </a>
                    .
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
