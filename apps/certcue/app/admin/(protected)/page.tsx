import { Building2, Search, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { listAdminCustomers, listPortfolio } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q ?? "").trim().toLowerCase();
  const allUsers = await listAdminCustomers();
  const users = query
    ? allUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query) ||
          user.stripeCustomerId?.toLowerCase().includes(query),
      )
    : allUsers;
  const rows = await Promise.all(
    users.slice(0, 100).map(async (user) => ({
      user,
      properties: await listPortfolio(user.id),
    })),
  );
  const paid = allUsers.filter((user) => user.plan === "paid").length;
  const pilots = allUsers.filter((user) => user.plan === "pilot").length;
  const suspended = allUsers.filter((user) => user.adminSuspendedAt).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
            Account operations
          </p>
          <h1 className="mt-2 text-4xl">Customers</h1>
          <p className="mt-2 text-[#65715d]">
            Read-only overview until you deliberately open an account control.
          </p>
        </div>
        <form className="flex min-w-72 gap-2" method="get">
          <label className="sr-only" htmlFor="customer-search">
            Search customers
          </label>
          <input
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#bcc7ae] bg-white px-4"
            defaultValue={query}
            id="customer-search"
            name="q"
            placeholder="Email, user or Stripe ID"
            type="search"
          />
          <button
            aria-label="Search"
            className="grid min-h-11 min-w-11 place-items-center rounded-xl bg-[#18220d] text-white"
            type="submit"
          >
            <Search aria-hidden="true" size={18} />
          </button>
        </form>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "All accounts", value: allUsers.length, icon: Users },
          { label: "Paid", value: paid, icon: ShieldCheck },
          { label: "Pilots", value: pilots, icon: Building2 },
          { label: "Suspended", value: suspended, icon: ShieldCheck },
        ].map(({ label, value, icon: Icon }) => (
          <div
            className="rounded-2xl border border-[#d5dbc9] bg-white p-5"
            key={label}
          >
            <Icon aria-hidden="true" className="text-[#52720d]" size={20} />
            <strong className="mt-5 block text-3xl">{value}</strong>
            <span className="text-[#65715d] text-sm">{label}</span>
          </div>
        ))}
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#d5dbc9] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f7f8f3] text-[#65715d]">
              <tr>
                <th className="px-5 py-4 font-black">Customer</th>
                <th className="px-5 py-4 font-black">Plan</th>
                <th className="px-5 py-4 font-black">Properties</th>
                <th className="px-5 py-4 font-black">Certificates</th>
                <th className="px-5 py-4 font-black">Access</th>
                <th className="px-5 py-4 font-black">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7db]">
              {rows.map(({ user, properties }) => (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <strong className="block">{user.email}</strong>
                    <span className="font-mono text-[#65715d] text-xs">
                      {user.id}
                    </span>
                  </td>
                  <td className="px-5 py-4 capitalize">
                    {user.plan ?? "unknown"}
                  </td>
                  <td className="px-5 py-4">{properties.length}</td>
                  <td className="px-5 py-4">
                    {properties.reduce(
                      (sum, property) => sum + property.certificates.length,
                      0,
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 font-black text-xs ${user.adminSuspendedAt ? "bg-[#ffe0d9] text-[#7a2514]" : "bg-[#dff5d8] text-[#26531b]"}`}
                    >
                      {user.adminSuspendedAt
                        ? "suspended"
                        : user.subscriptionStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      className="font-black underline"
                      href={`/admin/customers/${user.id}`}
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-[#65715d]">
            No matching customers.
          </p>
        ) : null}
        {users.length > 100 ? (
          <p className="border-[#e2e7db] border-t bg-[#fff0bd] px-5 py-3 text-[#684c00] text-sm">
            Showing the first 100 matches. Refine the search to find a specific
            account.
          </p>
        ) : null}
      </section>
    </main>
  );
}
