import { CheckCircle2, Clock3, CreditCard, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { assessCertificate, recommendedCertificates } from "@/lib/compliance";
import { getUserByToken, listPortfolio } from "@/lib/data";
import {
  openBillingPortal,
  updateCertificate,
  uploadCertificate,
} from "../actions";

export const dynamic = "force-dynamic";

function statusStyle(status: string) {
  if (status === "Current") return "bg-[#dff5d8] text-[#26531b]";
  if (status === "Due soon") return "bg-[#fff0bd] text-[#684c00]";
  return "bg-[#ffe0d9] text-[#7a2514]";
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ saved?: string; upload?: string }>;
}) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  const user = await getUserByToken(token);
  if (!user) notFound();
  const properties = await listPortfolio(user.id);
  const { saved, upload } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 md:px-8">
      <a className="font-black text-xl" href="/">
        Let<span className="text-[#52720d]">Due</span>
      </a>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-black text-[#52720d] text-sm uppercase">
            Private portfolio
          </p>
          <h1 className="mt-2 text-4xl md:text-6xl">
            Your compliance calendar
          </h1>
          <p className="mt-3 text-[#65715d]">
            Reminders go to {user.email}. Keep this dashboard link private.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-2 font-black text-sm ${
              user.subscriptionStatus === "active"
                ? "bg-[#dff5d8] text-[#26531b]"
                : "bg-[#ffe0d9] text-[#7a2514]"
            }`}
          >
            {user.subscriptionStatus.replace("_", " ")}
          </span>
          <form action={openBillingPortal}>
            <input name="token" type="hidden" value={token} />
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#bcc7ae] bg-white px-4 font-black"
              type="submit"
            >
              <CreditCard size={17} /> Billing
            </button>
          </form>
        </div>
      </div>

      {saved ? (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-[#dff5d8] p-4 font-bold text-[#26531b]">
          <CheckCircle2 size={19} /> Deadline updated. Future reminders now use
          this date.
        </p>
      ) : null}

      {upload ? (
        <p
          className={`mt-6 rounded-xl p-4 font-bold ${
            upload === "success"
              ? "bg-[#dff5d8] text-[#26531b]"
              : "bg-[#fff0bd] text-[#684c00]"
          }`}
        >
          {upload === "success"
            ? "Certificate stored securely and its deadline added."
            : upload === "review"
              ? "We could not confidently read that PDF. Add its date manually below."
              : "Please upload a PDF smaller than 10 MB."}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6">
        {properties.map((property) => {
          const required = recommendedCertificates(
            property.hasGas,
            property.isHmo,
          );
          const byKind = new Map(
            property.certificates.map((certificate) => [
              certificate.kind,
              certificate,
            ]),
          );
          return (
            <section
              className="overflow-hidden rounded-2xl border border-[#d5dbc9] bg-white"
              key={property.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-[#d5dbc9] border-b bg-[#18220d] p-5 text-white">
                <div>
                  <p className="font-bold text-[#d9ff73] text-xs uppercase">
                    Monitored property
                  </p>
                  <h2 className="mt-1 text-2xl">{property.address}</h2>
                </div>
                <span className="text-[#cbd4c5] text-sm">
                  {required.length} checks tracked
                </span>
              </div>
              <form
                action={uploadCertificate}
                className="flex flex-wrap items-center gap-3 border-[#d5dbc9] border-b bg-[#f7f8f3] p-4"
              >
                <input name="token" type="hidden" value={token} />
                <input name="propertyId" type="hidden" value={property.id} />
                <input
                  accept="application/pdf,.pdf"
                  className="min-w-0 flex-1 rounded-lg border border-[#bcc7ae] bg-white p-2"
                  name="certificate"
                  required
                  type="file"
                />
                <button
                  className="min-h-11 rounded-lg bg-[#18220d] px-4 font-black text-white"
                  type="submit"
                >
                  Read and store PDF
                </button>
              </form>
              <div className="divide-y divide-[#e2e7db]">
                {required.map((kind) => {
                  const certificate = byKind.get(kind);
                  const assessment = assessCertificate({
                    kind,
                    expiry: certificate?.expiryDate ?? "",
                  });
                  return (
                    <div
                      className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
                      key={kind}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {assessment.status === "Current" ? (
                            <Clock3 className="text-[#52720d]" size={19} />
                          ) : (
                            <ShieldAlert className="text-[#ad4f22]" size={19} />
                          )}
                          <strong>{kind}</strong>
                          <span
                            className={`rounded-full px-2.5 py-1 font-black text-xs ${statusStyle(assessment.status)}`}
                          >
                            {assessment.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[#65715d] text-sm">
                          {certificate?.expiryDate
                            ? `Expiry: ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(`${certificate.expiryDate}T12:00:00`))}`
                            : "Add the expiry date to activate reminders."}
                        </p>
                      </div>
                      <form
                        action={updateCertificate}
                        className="flex flex-wrap gap-2"
                      >
                        <input name="token" type="hidden" value={token} />
                        <input
                          name="propertyId"
                          type="hidden"
                          value={property.id}
                        />
                        <input name="kind" type="hidden" value={kind} />
                        <input
                          className="min-h-11 rounded-lg border border-[#bcc7ae] px-3"
                          defaultValue={certificate?.expiryDate ?? ""}
                          name="expiryDate"
                          required
                          type="date"
                        />
                        <button
                          className="min-h-11 rounded-lg bg-[#d9ff73] px-4 font-black"
                          type="submit"
                        >
                          Save date
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
