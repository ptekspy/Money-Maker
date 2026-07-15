import {
  ArrowUpRight,
  Building2,
  Database,
  MailPlus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { type Company, listCompanies } from "@/lib/database";
import { addCompany, initializeDatabase, updateCompanyStatus } from "./actions";

const statuses = [
  "Not contacted",
  "Contacted",
  "Replied",
  "Interested",
  "Won",
  "Lost",
];

function statusClass(status: string) {
  if (status === "Interested" || status === "Won") {
    return "bg-[#dff3e6] text-[#176b4f]";
  }
  if (status === "Replied") return "bg-[#e7eef8] text-[#27466d]";
  if (status === "Contacted") return "bg-[#fff1c7] text-[#6d4b00]";
  if (status === "Lost") return "bg-[#f5dddd] text-[#7a1f1f]";
  return "bg-[#ecefeb] text-[#4d5a51]";
}

export default async function DashboardPage() {
  let companies: Company[] = [];
  let databaseReady = true;

  try {
    companies = await listCompanies();
  } catch {
    databaseReady = false;
  }

  const counts = statuses.map((status) => ({
    status,
    count: companies.filter((company) => company.status === status).length,
  }));

  return (
    <main className="min-h-screen">
      <header className="border-[#d7ddd7] border-b bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-extrabold text-[#176b4f] text-sm uppercase">
              QuoteWinBack
            </p>
            <h1 className="font-black text-3xl tracking-normal">
              Marketing cockpit
            </h1>
          </div>
          <form action={initializeDatabase}>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#cbd4cc] bg-white px-3 font-extrabold"
              type="submit"
            >
              <Database size={18} aria-hidden="true" />
              Seed data
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-8">
        {!databaseReady ? (
          <section className="rounded-lg border border-[#f2d184] bg-[#fff8df] p-5">
            <h2 className="font-extrabold text-xl">Database needs setup</h2>
            <p className="mt-2 max-w-2xl text-[#6d4b00] leading-7">
              Add the Neon connection string, then use Seed data once to create
              the tables and load the prospect tracker.
            </p>
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-6">
          {counts.map(({ status, count }) => (
            <div
              className="rounded-lg border border-[#d7ddd7] bg-white p-4"
              key={status}
            >
              <p className="font-bold text-[#66736a] text-sm">{status}</p>
              <strong className="mt-2 block text-3xl">{count}</strong>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-lg border border-[#d7ddd7] bg-white">
            <div className="flex items-center justify-between border-[#d7ddd7] border-b p-4">
              <h2 className="font-extrabold text-xl">Companies</h2>
              <Building2 size={20} aria-hidden="true" />
            </div>
            <div className="divide-y divide-[#e5e9e5]">
              {companies.map((company) => (
                <article
                  className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_190px_48px] md:items-center"
                  key={company.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-extrabold text-lg">
                        {company.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 font-extrabold text-xs ${statusClass(company.status)}`}
                      >
                        {company.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[#66736a] text-sm">
                      {[company.niche, company.city, company.phone]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[#3f4c43] text-sm leading-6">
                      {company.lead_leak_signal}
                    </p>
                  </div>
                  <form action={updateCompanyStatus}>
                    <input name="id" type="hidden" value={company.id} />
                    <select
                      className="min-h-10 w-full rounded-md border border-[#cbd4cc] bg-white px-3"
                      name="status"
                      defaultValue={company.status}
                      aria-label={`Status for ${company.name}`}
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-md bg-[#17211d] px-3 font-extrabold text-white text-sm"
                      type="submit"
                    >
                      Save
                    </button>
                  </form>
                  <Link
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-[#cbd4cc]"
                    href={`/companies/${company.id}`}
                    aria-label={`Open ${company.name}`}
                  >
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <form
            action={addCompany}
            className="grid content-start gap-3 rounded-lg border border-[#d7ddd7] bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-xl">Add company</h2>
              <Plus size={20} aria-hidden="true" />
            </div>
            {[
              ["name", "Company name"],
              ["website", "Website"],
              ["city", "City"],
              ["county", "County"],
              ["niche", "Niche"],
              ["owner_or_manager", "Owner or manager"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["source", "Source"],
            ].map(([name, label]) => (
              <label className="grid gap-1 font-bold text-sm" key={name}>
                {label}
                <input
                  className="min-h-10 rounded-md border border-[#cbd4cc] px-3 font-normal"
                  name={name}
                  required={name === "name"}
                />
              </label>
            ))}
            <label className="grid gap-1 font-bold text-sm">
              Lead leak signal
              <textarea
                className="min-h-20 rounded-md border border-[#cbd4cc] px-3 py-2 font-normal"
                name="lead_leak_signal"
              />
            </label>
            <label className="grid gap-1 font-bold text-sm">
              Next step
              <input
                className="min-h-10 rounded-md border border-[#cbd4cc] px-3 font-normal"
                name="next_step"
              />
            </label>
            <label className="grid gap-1 font-bold text-sm">
              Notes
              <textarea
                className="min-h-20 rounded-md border border-[#cbd4cc] px-3 py-2 font-normal"
                name="notes"
              />
            </label>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#17211d] px-4 font-extrabold text-white"
              type="submit"
            >
              <MailPlus size={18} aria-hidden="true" />
              Add to queue
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
