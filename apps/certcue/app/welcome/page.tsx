import Link from "next/link";
import { sendDashboardLink } from "@/app/actions/dashboard-link";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ dashboard?: string }>;
}) {
  const { dashboard } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="max-w-xl rounded-2xl border border-[#d5dbc9] bg-white p-8 text-center">
        <p className="font-black text-[#52720d] text-sm uppercase">
          Monitoring active
        </p>
        <h1 className="mt-3 text-4xl">Welcome to LetDue.</h1>
        <p className="mt-4 text-[#65715d] leading-7">
          Your property is being added now. We have emailed your private
          dashboard link to the address used at checkout.
        </p>
        <form
          action={sendDashboardLink}
          className="mt-6 rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-4 text-left"
        >
          {dashboard === "sent" ? (
            <p className="mb-3 rounded-xl bg-[#dff5d8] p-3 font-bold text-[#26531b] text-sm">
              If that email exists in LetDue, we have sent the dashboard link.
            </p>
          ) : null}
          <label className="grid gap-1 font-bold text-sm">
            Need the dashboard email again?
            <input
              className="min-h-11 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
              name="email"
              placeholder="Email used at checkout"
              required
              type="email"
            />
          </label>
          <label className="hidden">
            Website
            <input autoComplete="off" name="website" tabIndex={-1} />
          </label>
          <button
            className="mt-3 min-h-11 rounded-lg bg-[#18220d] px-4 font-black text-white"
            type="submit"
          >
            Email my dashboard link
          </button>
        </form>
        <p className="mt-4 text-[#65715d] text-sm leading-6">
          LetDue organises documents, dates and reminders. It does not provide
          legal advice or guarantee compliance.
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-[#18220d] px-5 font-black text-white"
          href="/"
        >
          Back to LetDue
        </Link>
      </section>
    </main>
  );
}
