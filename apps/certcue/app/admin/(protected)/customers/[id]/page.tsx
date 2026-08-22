import {
  ArrowLeft,
  ExternalLink,
  Mail,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  resendDashboardLink,
  updatePropertyLimit,
  updateSuspension,
} from "@/app/admin/actions";
import { getUser, listPortfolio, propertyLimitForUser } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const user = await getUser(id);
  if (!user) notFound();
  const properties = await listPortfolio(user.id);
  const propertyLimit = propertyLimitForUser(user);
  const certificateCount = properties.reduce(
    (sum, property) => sum + property.certificates.length,
    0,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <Link
        className="inline-flex items-center gap-2 font-black text-sm"
        href="/admin"
      >
        <ArrowLeft aria-hidden="true" size={17} /> Customers
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
            Customer account
          </p>
          <h1 className="mt-2 break-all text-3xl md:text-5xl">{user.email}</h1>
          <p className="mt-2 font-mono text-[#65715d] text-xs">{user.id}</p>
        </div>
        <span
          className={`rounded-full px-3 py-2 font-black text-sm ${user.adminSuspendedAt ? "bg-[#ffe0d9] text-[#7a2514]" : "bg-[#dff5d8] text-[#26531b]"}`}
        >
          {user.adminSuspendedAt
            ? "admin suspended"
            : user.subscriptionStatus.replace("_", " ")}
        </span>
      </div>

      {saved ? (
        <p className="mt-6 rounded-xl bg-[#dff5d8] p-4 font-bold text-[#26531b]">
          {saved === "limit"
            ? "Property limit updated. No properties or certificates were changed."
            : saved === "link"
              ? "The private dashboard link was emailed to the customer."
              : "Account access setting updated. Stripe billing status was not changed."}
        </p>
      ) : null}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Plan", user.plan ?? "unknown"],
          ["Properties", `${properties.length} / ${propertyLimit}`],
          ["Certificates", String(certificateCount)],
          ["Acquisition", user.acquisitionSource ?? "Not recorded"],
        ].map(([label, value]) => (
          <div
            className="rounded-2xl border border-[#d5dbc9] bg-white p-5"
            key={label}
          >
            <span className="font-black text-[#65715d] text-xs uppercase">
              {label}
            </span>
            <strong className="mt-3 block break-words text-xl capitalize">
              {value}
            </strong>
          </div>
        ))}
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#d5dbc9] bg-white p-6">
          <h2 className="text-2xl">Account controls</h2>
          <p className="mt-2 text-[#65715d] text-sm leading-6">
            Every change below targets this user profile only. Lowering a limit
            never deletes an existing property.
          </p>

          <form
            action={updatePropertyLimit}
            className="mt-6 grid gap-3 rounded-xl bg-[#f7f8f3] p-4 sm:grid-cols-[1fr_auto] sm:items-end"
          >
            <input name="userId" type="hidden" value={user.id} />
            <label className="grid gap-2 font-black text-sm">
              Property limit
              <input
                className="min-h-11 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                defaultValue={propertyLimit}
                max="10000"
                min={Math.max(1, properties.length)}
                name="propertyLimit"
                required
                type="number"
              />
            </label>
            <button
              className="min-h-11 rounded-lg bg-[#18220d] px-4 font-black text-white"
              type="submit"
            >
              Save limit
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-[#d5dbc9] p-4">
            <strong>Dashboard access</strong>
            <p className="mt-1 text-[#65715d] text-sm leading-6">
              Suspension blocks dashboard changes and reminders through a
              separate LetDue flag. It does not cancel or alter Stripe billing.
            </p>
            <form action={updateSuspension} className="mt-3">
              <input name="userId" type="hidden" value={user.id} />
              <input
                name="suspended"
                type="hidden"
                value={user.adminSuspendedAt ? "false" : "true"}
              />
              <button
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 font-black ${user.adminSuspendedAt ? "bg-[#dff5d8] text-[#26531b]" : "bg-[#ffe0d9] text-[#7a2514]"}`}
                type="submit"
              >
                {user.adminSuspendedAt ? (
                  <PlayCircle aria-hidden="true" size={18} />
                ) : (
                  <PauseCircle aria-hidden="true" size={18} />
                )}
                {user.adminSuspendedAt ? "Restore access" : "Suspend access"}
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d5dbc9] bg-white p-6">
          <h2 className="text-2xl">Account context</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="font-black text-[#65715d]">Stripe customer</dt>
              <dd className="mt-1 break-all font-mono">
                {user.stripeCustomerId ?? "Not linked"}
              </dd>
            </div>
            <div>
              <dt className="font-black text-[#65715d]">Pilot ends</dt>
              <dd className="mt-1">{formatDate(user.pilotEndsAt)}</dd>
            </div>
            <div>
              <dt className="font-black text-[#65715d]">Admin suspended</dt>
              <dd className="mt-1">{formatDate(user.adminSuspendedAt)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#bcc7ae] px-4 font-black"
              href={`/dashboard/${user.accessToken}`}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" size={17} /> Open dashboard
            </a>
            <form action={resendDashboardLink}>
              <input name="userId" type="hidden" value={user.id} />
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#d9ff73] px-4 font-black"
                type="submit"
              >
                <Mail aria-hidden="true" size={17} /> Email dashboard link
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-[#d5dbc9] bg-white p-6">
        <h2 className="text-2xl">Portfolio</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {properties.map((property) => (
            <article
              className="rounded-xl border border-[#d5dbc9] p-5"
              key={property.id}
            >
              <strong className="text-lg">{property.address}</strong>
              <p className="mt-1 text-[#65715d] text-sm">
                {property.certificates.length} certificates · Gas{" "}
                {property.hasGas ? "yes" : "no"} · Licence{" "}
                {property.isHmo ? "yes" : "no"}
              </p>
              <ul className="mt-4 grid gap-2 text-sm">
                {property.certificates.map((certificate) => (
                  <li
                    className="flex justify-between gap-3 rounded-lg bg-[#f7f8f3] px-3 py-2"
                    key={certificate.id}
                  >
                    <span>{certificate.kind}</span>
                    <span className="font-mono text-[#65715d]">
                      {certificate.expiryDate ?? "No date"}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {properties.length === 0 ? (
            <p className="text-[#65715d]">No properties yet.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
