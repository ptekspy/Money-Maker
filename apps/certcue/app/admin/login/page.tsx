import { KeyRound } from "lucide-react";
import { redirect } from "next/navigation";
import { requestAdminLink } from "@/app/admin/actions";
import { LetDueLogo } from "@/components/letdue-brand";
import { currentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  if (await currentAdmin()) redirect("/admin");
  const { sent, error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#d5dbc9] bg-white p-7 shadow-sm">
        <a aria-label="LetDue home" href="/">
          <LetDueLogo />
        </a>
        <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#18220d] text-[#d9ff73]">
          <KeyRound aria-hidden="true" size={21} />
        </div>
        <p className="mt-6 font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
          Private operations
        </p>
        <h1 className="mt-2 text-3xl">LetDue admin</h1>
        <p className="mt-3 text-[#65715d] leading-7">
          Enter the authorised address and LetDue will email a one-use sign-in
          link. No admin password is stored in the app.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl bg-[#dff5d8] p-4 text-[#26531b]">
            <p className="font-black">Check the authorised inbox.</p>
            <p className="mt-1 text-sm leading-6">
              If the address is authorised, a 15-minute sign-in link has been
              sent. Only one link can be requested every ten minutes.
            </p>
          </div>
        ) : (
          <form action={requestAdminLink} className="mt-6 grid gap-4">
            <label className="grid gap-2 font-black text-sm">
              Admin email
              <input
                autoComplete="email"
                className="min-h-12 rounded-xl border border-[#bcc7ae] px-4 font-normal"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <button
              className="min-h-12 rounded-xl bg-[#18220d] px-4 font-black text-white"
              type="submit"
            >
              Email my secure link
            </button>
          </form>
        )}

        {error ? (
          <p className="mt-4 rounded-xl bg-[#fff0bd] p-4 font-bold text-[#684c00] text-sm">
            That link is invalid, expired or already used. Request a new one.
          </p>
        ) : null}
        <a className="mt-6 inline-block font-bold text-sm underline" href="/">
          Back to LetDue
        </a>
      </section>
    </main>
  );
}
