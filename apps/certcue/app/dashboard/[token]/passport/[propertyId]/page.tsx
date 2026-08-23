import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { notFound } from "next/navigation";
import { LetDueLogo } from "@/components/letdue-brand";
import { PrintPassportButton } from "@/components/print-passport-button";
import { assessCertificate, recommendedCertificates } from "@/lib/compliance";
import { getUserByToken, listPortfolio } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(`${value}T12:00:00Z`),
  );
}

function badgeClass(status: string) {
  if (status === "Current") return "bg-[#dff5d8] text-[#26531b]";
  if (status === "Due soon") return "bg-[#fff0bd] text-[#684c00]";
  return "bg-[#ffe0d9] text-[#7a2514]";
}

export default async function PropertyPassportPage({
  params,
}: {
  params: Promise<{ token: string; propertyId: string }>;
}) {
  const { token, propertyId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token) || !/^[0-9a-f-]{36}$/i.test(propertyId))
    notFound();
  const user = await getUserByToken(token);
  if (!user) notFound();
  const property = (await listPortfolio(user.id)).find(
    (candidate) => candidate.id === propertyId,
  );
  if (!property) notFound();

  const byKind = new Map(
    property.certificates.map((certificate) => [certificate.kind, certificate]),
  );
  const checks = recommendedCertificates(property.hasGas, property.isHmo).map(
    (kind) => ({
      kind,
      certificate: byKind.get(kind),
      assessment: assessCertificate({
        kind,
        expiry: byKind.get(kind)?.expiryDate ?? "",
      }),
    }),
  );
  const currentCount = checks.filter(
    ({ assessment }) => assessment.status === "Current",
  ).length;
  const generatedAt = new Date();

  return (
    <main className="passport-page mx-auto min-h-screen max-w-5xl px-4 py-8 md:px-8">
      <div className="passport-hide flex flex-wrap items-center justify-between gap-3">
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#bcc7ae] bg-white px-4 font-black"
          href={`/dashboard/${token}`}
        >
          <ArrowLeft size={18} /> Dashboard
        </a>
        <PrintPassportButton />
      </div>

      <article className="mt-5 overflow-hidden rounded-2xl border border-[#d5dbc9] bg-white print:mt-0 print:border-0">
        <header className="bg-[#18220d] p-6 text-white md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <LetDueLogo theme="dark" />
              <p className="mt-8 font-black text-[#d9ff73] text-xs uppercase">
                Property compliance passport
              </p>
              <h1 className="mt-2 max-w-3xl text-3xl md:text-5xl">
                {property.address}
              </h1>
            </div>
            <div className="rounded-xl bg-white/10 p-4 text-right">
              <strong className="text-3xl">
                {currentCount}/{checks.length}
              </strong>
              <p className="mt-1 text-[#cbd4c5] text-sm">checks current</p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-[#cbd4c5] text-sm leading-6">
            A time-stamped record of the documents and dates held in LetDue.
            This passport supports record keeping and does not certify or
            guarantee legal compliance.
          </p>
        </header>

        <section className="p-6 md:p-8">
          <div className="flex flex-wrap justify-between gap-3 border-[#d5dbc9] border-b pb-5 text-sm">
            <span>
              <strong>Generated:</strong>{" "}
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(generatedAt)}
            </span>
            <span className="text-[#65715d]">Private account evidence</span>
          </div>

          <h2 className="mt-7 text-2xl">Current evidence</h2>
          <div className="mt-4 grid gap-3">
            {checks.map(({ kind, certificate, assessment }) => (
              <div
                className="grid gap-4 rounded-xl border border-[#e2e7db] p-4 md:grid-cols-[1fr_auto] md:items-center"
                key={kind}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {assessment.status === "Current" ? (
                      <CheckCircle2 className="text-[#52720d]" size={19} />
                    ) : assessment.status === "Due soon" ? (
                      <Clock3 className="text-[#9a7100]" size={19} />
                    ) : (
                      <ShieldAlert className="text-[#ad4f22]" size={19} />
                    )}
                    <strong>{kind}</strong>
                    <span
                      className={`rounded-full px-2.5 py-1 font-black text-xs ${badgeClass(assessment.status)}`}
                    >
                      {assessment.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[#65715d] text-sm">
                    {certificate?.expiryDate
                      ? `Expiry recorded: ${formatDate(certificate.expiryDate)}`
                      : "No expiry date is currently recorded."}
                  </p>
                  {certificate?.originalFileName ? (
                    <p className="mt-1 text-[#65715d] text-xs">
                      Evidence: {certificate.originalFileName}
                    </p>
                  ) : null}
                </div>
                {certificate?.documentKey ? (
                  <a
                    className="passport-hide inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#bcc7ae] px-3 font-black text-sm"
                    href={`/dashboard/${token}/document/${property.id}?kind=${encodeURIComponent(kind)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FileText size={17} /> View evidence{" "}
                    <ExternalLink size={14} />
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-2xl">Evidence history</h2>
          {property.auditEvents.length > 0 ? (
            <ol className="mt-4 grid gap-3">
              {property.auditEvents.map((event) => (
                <li
                  className="grid gap-1 border-[#e2e7db] border-b pb-3 text-sm md:grid-cols-[170px_1fr]"
                  key={event.id}
                >
                  <time className="font-bold text-[#65715d]">
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(event.createdAt))}
                  </time>
                  <span>{event.summary}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-[#65715d]">
              History will appear as documents and deadlines are updated.
            </p>
          )}
        </section>
      </article>
    </main>
  );
}
