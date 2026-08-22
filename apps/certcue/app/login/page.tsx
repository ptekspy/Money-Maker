import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginCustomer } from "@/app/actions/account";
import { LetDueLogo } from "@/components/letdue-brand";
import { currentUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Customer login | LetDue",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await currentUser()) redirect("/account");
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#d5dbc9] bg-white p-7 shadow-sm md:p-9">
        <Link aria-label="LetDue home" href="/">
          <LetDueLogo />
        </Link>
        <p className="mt-8 font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
          Customer account
        </p>
        <h1 className="mt-2 text-3xl">Sign in to LetDue</h1>
        <p className="mt-3 text-[#65715d] leading-7">
          Use the email and password you created when accepting your package.
        </p>
        {error ? (
          <p className="mt-5 rounded-xl bg-[#ffe0d9] p-4 font-bold text-[#7a2514] text-sm">
            That email or password was not recognised.
          </p>
        ) : null}
        <form action={loginCustomer} className="mt-6 space-y-4">
          <label className="block font-black text-sm">
            Email
            <input
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#bcc7ae] px-4 font-normal"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block font-black text-sm">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 min-h-12 w-full rounded-xl border border-[#bcc7ae] px-4 font-normal"
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="min-h-12 w-full rounded-xl bg-[#18220d] px-5 font-black text-white"
            type="submit"
          >
            Sign in
          </button>
        </form>
        <Link className="mt-6 inline-block font-black underline" href="/">
          Back to LetDue
        </Link>
      </section>
    </main>
  );
}
