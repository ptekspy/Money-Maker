import { CheckCircle2, Clock3, CreditCard, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { startPilotCheckout } from "@/app/actions/checkout";
import { assessCertificate, recommendedCertificates } from "@/lib/compliance";
import { getUserByToken, hasActiveAccess, listPortfolio } from "@/lib/data";
import {
  addPortfolioProperty,
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
  searchParams: Promise<{
    saved?: string;
    upload?: string;
    pilot?: string;
    property?: string;
    billing?: string;
  }>;
}) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  const user = await getUserByToken(token);
  if (!user) notFound();
  const properties = await listPortfolio(user.id);
  const {
    saved,
    upload,
    pilot,
    property: propertyResult,
    billing,
  } = await searchParams;
  const accessActive = hasActiveAccess(user);
  const pilotEnds = user.pilotEndsAt
    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
        new Date(user.pilotEndsAt),
      )
    : null;

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
              accessActive
                ? "bg-[#dff5d8] text-[#26531b]"
                : "bg-[#ffe0d9] text-[#7a2514]"
            }`}
          >
            {user.plan === "pilot" && !accessActive
              ? "pilot ended"
              : user.subscriptionStatus.replace("_", " ")}
          </span>
          {user.plan !== "pilot" ? (
            <form action={openBillingPortal}>
              <input name="token" type="hidden" value={token} />
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#bcc7ae] bg-white px-4 font-black"
                type="submit"
              >
                <CreditCard size={17} /> Billing
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {pilot === "started" ? (
        <div className="mt-6 rounded-xl bg-[#dff5d8] p-5 text-[#26531b]">
          <p className="font-black">Your free pilot is active.</p>
          <p className="mt-1 text-sm leading-6">
            Bookmark this private page now. Your pilot runs until {pilotEnds}.
            Add up to two more properties below and upload the certificates you
            already have.
          </p>
        </div>
      ) : null}

      {billing ? (
        <div
          className={`mt-6 rounded-xl p-5 ${
            billing === "cancelled"
              ? "bg-[#fff0bd] text-[#684c00]"
              : "bg-[#dff5d8] text-[#26531b]"
          }`}
        >
          <p className="font-black">
            {billing === "cancelled"
              ? "Checkout cancelled — nothing was charged."
              : user.plan === "paid"
                ? "Thank you — your monitoring is active."
                : "Payment received. Your account is being activated."}
          </p>
        </div>
      ) : null}

      {user.plan === "pilot" ? (
        <section className="mt-8 grid gap-5 rounded-2xl bg-[#18220d] p-6 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-black text-[#d9ff73] text-xs uppercase">
              {accessActive ? "Founding pilot" : "Pilot ended"}
            </p>
            <h2 className="mt-2 text-3xl">
              Keep every property deadline on watch.
            </h2>
            <p className="mt-2 max-w-2xl text-[#cbd4c5] leading-7">
              Continue monitoring up to three properties, with secure PDF
              storage and email reminders at 90, 30, 14, 7 and 0 days.
            </p>
          </div>
          <div className="min-w-52 rounded-xl bg-white p-5 text-[#18220d]">
            <p>
              <strong className="text-4xl">£29</strong>{" "}
              <span className="font-bold text-[#65715d]">/ year</span>
            </p>
            <form action={startPilotCheckout} className="mt-4">
              <input name="token" type="hidden" value={token} />
              <button
                className="min-h-12 w-full rounded-lg bg-[#d9ff73] px-4 font-black"
                type="submit"
              >
                Continue monitoring
              </button>
            </form>
            <p className="mt-2 text-center text-[#65715d] text-xs">
              Secure checkout · Cancel any time
            </p>
          </div>
        </section>
      ) : null}

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

      {propertyResult ? (
        <p
          className={`mt-6 rounded-xl p-4 font-bold ${
            propertyResult === "added"
              ? "bg-[#dff5d8] text-[#26531b]"
              : "bg-[#fff0bd] text-[#684c00]"
          }`}
        >
          {propertyResult === "added"
            ? "Property added. Add its dates or upload a certificate below."
            : "This plan monitors up to three properties."}
        </p>
      ) : null}

      {accessActive && properties.length < 3 ? (
        <section className="mt-8 rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-5">
          <p className="font-black text-[#52720d] text-xs uppercase">
            Portfolio setup
          </p>
          <h2 className="mt-1 text-2xl">Add another property</h2>
          <form
            action={addPortfolioProperty}
            className="mt-4 grid gap-3 md:grid-cols-[minmax(240px,1fr)_auto_auto_auto] md:items-end"
          >
            <input name="token" type="hidden" value={token} />
            <label className="grid gap-1 font-bold text-sm">
              Property address
              <input
                className="min-h-11 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                name="address"
                placeholder="e.g. 22 Park Road, Leeds"
                required
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[#d5dbc9] bg-white px-3 font-bold text-sm">
              <input defaultChecked name="hasGas" type="checkbox" /> Gas
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[#d5dbc9] bg-white px-3 font-bold text-sm">
              <input name="isHmo" type="checkbox" /> Licence
            </label>
            <button
              className="min-h-11 rounded-lg bg-[#18220d] px-4 font-black text-white"
              type="submit"
            >
              Add property
            </button>
          </form>
        </section>
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
              {accessActive ? (
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
              ) : null}
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
                      {accessActive ? (
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
                      ) : null}
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
