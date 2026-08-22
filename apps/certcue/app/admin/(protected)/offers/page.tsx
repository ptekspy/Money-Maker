import { CheckCircle2, MailPlus } from "lucide-react";
import { sendCustomerPackage } from "@/app/admin/actions";
import { listOffers } from "@/lib/data";

export const dynamic = "force-dynamic";

function money(pricePence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pricePence / 100);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const offers = await listOffers();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div>
        <p className="font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
          Bespoke onboarding
        </p>
        <h1 className="mt-2 text-4xl">Send a customer package</h1>
        <p className="mt-2 max-w-3xl text-[#65715d] leading-7">
          The customer receives a private seven-day link, creates a password,
          then continues to Stripe Checkout at the exact annual price below.
        </p>
      </div>

      {sent ? (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-[#dff5d8] p-4 font-bold text-[#26531b]">
          <CheckCircle2 size={19} /> Package email sent.
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-xl bg-[#ffe0d9] p-4 font-bold text-[#7a2514]">
          {error === "active"
            ? "That email already has an active paid subscription. Manage its property limit from the customer record instead."
            : "Check the email, property count and price. Price must be between £1 and £10,000."}
        </p>
      ) : null}

      <section className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,560px)_1fr]">
        <form
          action={sendCustomerPackage}
          className="rounded-2xl border border-[#d5dbc9] bg-white p-6 md:p-8"
        >
          <MailPlus aria-hidden="true" className="text-[#52720d]" size={24} />
          <div className="mt-6 space-y-5">
            <label className="block font-black text-sm">
              Customer email
              <input
                autoComplete="email"
                className="mt-2 min-h-12 w-full rounded-xl border border-[#bcc7ae] px-4 font-normal"
                name="email"
                placeholder="customer@example.com"
                required
                type="email"
              />
            </label>
            <label className="block font-black text-sm">
              Properties included
              <input
                className="mt-2 min-h-12 w-full rounded-xl border border-[#bcc7ae] px-4 font-normal"
                defaultValue="5"
                max="100"
                min="1"
                name="propertyLimit"
                required
                type="number"
              />
            </label>
            <label className="block font-black text-sm">
              Annual price (GBP)
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-4 grid place-items-center font-black text-[#65715d]">
                  £
                </span>
                <input
                  className="min-h-12 w-full rounded-xl border border-[#bcc7ae] py-2 pr-4 pl-9 font-normal"
                  inputMode="decimal"
                  name="price"
                  placeholder="49.00"
                  required
                  type="text"
                />
              </div>
            </label>
          </div>
          <button
            className="mt-7 min-h-12 w-full rounded-xl bg-[#18220d] px-5 font-black text-white"
            type="submit"
          >
            Email private package
          </button>
          <p className="mt-3 text-[#65715d] text-xs leading-5">
            Sending creates an auditable offer record. It does not create a
            charge; only the customer can complete Stripe Checkout.
          </p>
        </form>

        <div className="overflow-hidden rounded-2xl border border-[#d5dbc9] bg-white">
          <div className="border-[#e2e7db] border-b px-5 py-4">
            <h2 className="text-xl">Recent packages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#f7f8f3] text-[#65715d]">
                <tr>
                  <th className="px-5 py-3 font-black">Customer</th>
                  <th className="px-5 py-3 font-black">Package</th>
                  <th className="px-5 py-3 font-black">Status</th>
                  <th className="px-5 py-3 font-black">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7db]">
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td className="px-5 py-4 font-bold">{offer.email}</td>
                    <td className="px-5 py-4">
                      {offer.propertyLimit} properties ·{" "}
                      {money(offer.pricePence)} / year
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#eef0e7] px-2.5 py-1 font-black text-xs capitalize">
                        {offer.status === "sent" &&
                        offer.expiresAtEpoch < Math.floor(Date.now() / 1000)
                          ? "expired"
                          : offer.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#65715d]">
                      {date(offer.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {offers.length === 0 ? (
            <p className="p-8 text-center text-[#65715d]">
              No packages sent yet.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
