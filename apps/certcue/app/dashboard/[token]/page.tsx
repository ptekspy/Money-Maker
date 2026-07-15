import { notFound } from "next/navigation";
import { getSql } from "@/lib/database";

type DashboardRow = {
  email: string;
  subscription_status: string;
  address: string;
  kind: string | null;
  expiry_date: string | null;
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  const rows = (await getSql()`
    select u.email, u.subscription_status, p.address, c.kind, c.expiry_date::text
    from certcue_users u
    join certcue_properties p on p.user_id = u.id
    left join certcue_certificates c on c.property_id = p.id
    where u.access_token = ${token}
    order by p.created_at, c.expiry_date nulls last
  `) as DashboardRow[];
  if (!rows.length) notFound();

  const properties = rows.reduce<Record<string, DashboardRow[]>>(
    (grouped, row) => {
      if (!grouped[row.address]) grouped[row.address] = [];
      grouped[row.address].push(row);
      return grouped;
    },
    {},
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 md:px-8">
      <p className="font-black text-[#52720d] text-sm uppercase">
        Private portfolio
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl md:text-6xl">Your LetDue dashboard</h1>
        <span className="rounded-full bg-[#dff5d8] px-3 py-1 font-black text-[#26531b] text-sm">
          {rows[0].subscription_status}
        </span>
      </div>
      <p className="mt-3 text-[#65715d]">
        Reminders are sent to {rows[0].email}.
      </p>
      <div className="mt-8 grid gap-5">
        {Object.entries(properties).map(([address, certificates]) => (
          <section
            className="overflow-hidden rounded-2xl border border-[#d5dbc9] bg-white"
            key={address}
          >
            <h2 className="border-[#d5dbc9] border-b p-5 text-2xl">
              {address}
            </h2>
            <div className="divide-y divide-[#e2e7db]">
              {certificates
                .filter((item) => item.kind)
                .map((item) => (
                  <div
                    className="flex flex-wrap justify-between gap-3 p-5"
                    key={`${item.kind}-${item.expiry_date}`}
                  >
                    <strong>{item.kind}</strong>
                    <span className="font-mono text-[#65715d]">
                      {item.expiry_date ?? "Date missing"}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
