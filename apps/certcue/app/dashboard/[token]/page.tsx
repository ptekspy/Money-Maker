import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import { notFound } from "next/navigation";
import { startPilotCheckout } from "@/app/actions/checkout";
import { LetDueLogo } from "@/components/letdue-brand";
import { PortfolioPlans } from "@/components/portfolio-plans";
import { SupportForm } from "@/components/support-form";
import { assessCertificate, recommendedCertificates } from "@/lib/compliance";
import {
  getUserByToken,
  hasActiveAccess,
  listPortfolio,
  propertyLimitForUser,
} from "@/lib/data";
import {
  addPortfolioProperty,
  confirmInboxItem,
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
    support?: string;
    upgrade?: string;
    filed?: string;
    review?: string;
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
    support,
    upgrade,
    filed,
    review,
  } = await searchParams;
  const accessActive = hasActiveAccess(user);
  const propertyLimit = propertyLimitForUser(user);
  const pilotEnds = user.pilotEndsAt
    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
        new Date(user.pilotEndsAt),
      )
    : null;
  const reviewItems = properties.flatMap((property) =>
    property.inboxItems
      .filter((item) => item.status === "needs_review")
      .map((item) => ({ ...item, propertyAddress: property.address })),
  );
  const portfolioAssessments = properties.flatMap((property) => {
    const byKind = new Map(
      property.certificates.map((certificate) => [
        certificate.kind,
        certificate,
      ]),
    );
    return recommendedCertificates(property.hasGas, property.isHmo).map(
      (kind) => ({
        property,
        kind,
        assessment: assessCertificate({
          kind,
          expiry: byKind.get(kind)?.expiryDate ?? "",
        }),
      }),
    );
  });
  const urgentCount = portfolioAssessments.filter(({ assessment }) =>
    ["Missing", "Overdue", "Due soon"].includes(assessment.status),
  ).length;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 md:px-8">
      <a aria-label="LetDue home" href="/">
        <LetDueLogo />
      </a>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-black text-[#52720d] text-sm uppercase">
            Private portfolio
          </p>
          <h1 className="mt-2 text-4xl md:text-6xl">
            Portfolio control centre
          </h1>
          <p className="mt-3 text-[#65715d]">
            See what needs action, file evidence and keep every property ready.
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
              : user.subscriptionStatus === "active"
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
              Continue monitoring up to {propertyLimit} properties, with secure
              PDF storage and email reminders at 90, 30, 14, 7 and 0 days.
            </p>
          </div>
          <div className="min-w-52 rounded-xl bg-white p-5 text-[#18220d]">
            <p>
              <strong className="text-4xl">£28</strong>{" "}
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
            ? `${filed ?? "Your"} document${filed === "1" ? " was" : "s were"} securely filed and added to the relevant passport.`
            : upload === "confirmed"
              ? "Document confirmed and added to the property passport."
              : upload === "review"
                ? `${filed ?? "0"} filed automatically. ${review ?? "Some"} need${review === "1" ? "s" : ""} a quick check below — no document was discarded.`
                : "Please upload a PDF smaller than 10 MB."}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-[#18220d] p-5 text-white md:col-span-2">
          <p className="font-black text-[#d9ff73] text-xs uppercase">
            What needs action
          </p>
          <div className="mt-3 flex items-end gap-3">
            <strong className="text-5xl">{urgentCount}</strong>
            <span className="pb-1 text-[#cbd4c5]">
              missing, overdue or due-soon item{urgentCount === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-4 text-[#cbd4c5] text-sm leading-6">
            LetDue uses the dates and evidence you provide to highlight the next
            actions. It does not guarantee legal compliance.
          </p>
        </div>
        <div className="rounded-2xl border border-[#d5dbc9] bg-white p-5">
          <p className="font-black text-[#52720d] text-xs uppercase">
            Inbox review
          </p>
          <strong className="mt-3 block text-5xl">{reviewItems.length}</strong>
          <p className="mt-2 text-[#65715d] text-sm">
            document{reviewItems.length === 1 ? "" : "s"} waiting for
            confirmation
          </p>
        </div>
      </section>

      {accessActive && properties.length > 0 ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#d5dbc9] bg-white">
          <div className="grid gap-6 bg-[#f7f8f3] p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="flex items-center gap-2 font-black text-[#52720d] text-xs uppercase">
                <Inbox size={16} /> Compliance inbox
              </p>
              <h2 className="mt-2 text-3xl">Drop in a batch of certificates</h2>
              <p className="mt-2 max-w-2xl text-[#65715d] leading-6">
                Choose the property once. LetDue reads up to 20 PDFs (10 MB per
                batch), securely files confident matches and holds uncertain
                details for review.
              </p>
            </div>
            <form action={uploadCertificate} className="grid min-w-72 gap-3">
              <input name="token" type="hidden" value={token} />
              <label className="grid gap-1 font-bold text-sm">
                Property
                <select
                  className="min-h-11 rounded-lg border border-[#bcc7ae] bg-white px-3"
                  name="propertyId"
                  required
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}
                    </option>
                  ))}
                </select>
              </label>
              <input
                accept="application/pdf,.pdf"
                className="min-w-0 rounded-lg border border-[#bcc7ae] bg-white p-2"
                multiple
                name="certificates"
                required
                type="file"
              />
              <button
                className="min-h-12 rounded-lg bg-[#d9ff73] px-4 font-black text-[#18220d]"
                type="submit"
              >
                Read and file PDFs
              </button>
            </form>
          </div>

          {reviewItems.length > 0 ? (
            <div className="border-[#d5dbc9] border-t p-5">
              <h3 className="text-xl">Quick review</h3>
              <div className="mt-4 grid gap-3">
                {reviewItems.map((item) => (
                  <form
                    action={confirmInboxItem}
                    className="grid gap-3 rounded-xl border border-[#e2e7db] p-4 lg:grid-cols-[1fr_180px_170px_auto] lg:items-end"
                    key={item.id}
                  >
                    <input name="token" type="hidden" value={token} />
                    <input
                      name="propertyId"
                      type="hidden"
                      value={item.propertyId}
                    />
                    <input name="itemId" type="hidden" value={item.id} />
                    <input
                      name="uploadedAt"
                      type="hidden"
                      value={item.uploadedAt}
                    />
                    <div className="min-w-0">
                      <strong className="block truncate">
                        {item.fileName}
                      </strong>
                      <span className="text-[#65715d] text-sm">
                        {item.propertyAddress}
                      </span>
                    </div>
                    <label className="grid gap-1 font-bold text-xs">
                      Document type
                      <select
                        className="min-h-11 rounded-lg border border-[#bcc7ae] bg-white px-2 font-normal text-sm"
                        defaultValue={item.kind ?? ""}
                        name="kind"
                        required
                      >
                        <option disabled value="">
                          Choose type
                        </option>
                        {[
                          "Gas safety",
                          "EICR",
                          "EPC",
                          "Landlord insurance",
                          "Property licence",
                        ].map((kind) => (
                          <option key={kind}>{kind}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 font-bold text-xs">
                      Expiry date
                      <input
                        className="min-h-11 rounded-lg border border-[#bcc7ae] px-2 font-normal text-sm"
                        defaultValue={
                          item.expiryDate ?? item.candidates[0] ?? ""
                        }
                        name="expiryDate"
                        required
                        type="date"
                      />
                    </label>
                    <button
                      className="min-h-11 rounded-lg bg-[#18220d] px-4 font-black text-white"
                      type="submit"
                    >
                      Confirm
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ) : null}
        </section>
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
            : `This account monitors up to ${propertyLimit} properties.`}
        </p>
      ) : null}

      {upgrade ? (
        <div
          className={`mt-6 rounded-xl p-4 font-bold ${
            upgrade === "success"
              ? "bg-[#dff5d8] text-[#26531b]"
              : upgrade === "payment"
                ? "bg-[#fff0bd] text-[#684c00]"
                : "bg-[#ffe0d9] text-[#7a2514]"
          }`}
        >
          {upgrade === "success"
            ? `Upgrade complete. This account can now monitor up to ${propertyLimit} properties.`
            : upgrade === "payment"
              ? "Your bank needs another payment step. Complete it from the Stripe invoice, then your new allowance will activate automatically."
              : upgrade === "unavailable"
                ? "We could not find an active annual subscription to upgrade. Contact support and we will sort this out."
                : "That plan is not an available upgrade for this account."}
        </div>
      ) : null}

      {user.plan === "paid" && propertyLimit < 250 ? (
        <PortfolioPlans currentLimit={propertyLimit} token={token} />
      ) : null}

      {accessActive && properties.length < propertyLimit ? (
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
                <a
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#d9ff73] px-4 font-black text-[#18220d]"
                  href={`/dashboard/${token}/passport/${property.id}`}
                >
                  <FileCheck2 size={18} /> Open passport
                </a>
              </div>
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
      <SupportForm sent={support === "sent"} token={token} />
    </main>
  );
}
