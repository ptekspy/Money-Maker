import { ArrowLeft, Check, LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { startPublicSignup } from "@/app/actions/signup";
import { LetDueLogo } from "@/components/letdue-brand";
import {
  isPublicPropertyLimit,
  moneyFromPence,
  portfolioPlans,
} from "@/lib/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your account | LetDue",
  description:
    "Choose a LetDue portfolio plan and continue to secure checkout.",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string; source?: string; error?: string }>;
}) {
  const { pack, source, error } = await searchParams;
  const candidate = Number(pack);
  const propertyLimit = isPublicPropertyLimit(candidate) ? candidate : 3;
  const plan =
    portfolioPlans.find((item) => item.propertyLimit === propertyLimit) ??
    portfolioPlans[0];
  const acquisitionSource =
    source && /^[a-z0-9-]{1,64}$/.test(source)
      ? source
      : `pricing-${propertyLimit}`;

  return (
    <main className="min-h-screen bg-[#f7f8f3] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link aria-label="LetDue home" href="/">
            <LetDueLogo />
          </Link>
          <Link
            className="inline-flex items-center gap-2 font-black text-sm"
            href="/#pricing"
          >
            <ArrowLeft size={16} /> Compare plans
          </Link>
        </div>

        <div className="mt-9 grid overflow-hidden rounded-3xl border border-[#d5dbc9] bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-[#18220d] p-7 text-white md:p-10">
            <p className="font-black text-[#d9ff73] text-xs uppercase tracking-[0.16em]">
              {plan.popular ? "Most popular · " : ""}
              {plan.name}
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl">
              Up to {propertyLimit} properties
            </h1>
            <p className="mt-5">
              <strong className="text-5xl">
                {moneyFromPence(plan.pricePence)}
              </strong>
              <span className="font-bold text-[#cbd4c5]"> / year</span>
            </p>
            <p className="mt-5 text-[#cbd4c5] leading-7">{plan.description}</p>
            <ul className="mt-7 grid gap-3 border-white/15 border-t pt-7 text-sm">
              <li className="flex items-center gap-3 font-bold">
                <Check className="text-[#d9ff73]" size={18} /> Certificate
                storage and deadline tracking
              </li>
              <li className="flex items-center gap-3 font-bold">
                <Check className="text-[#d9ff73]" size={18} /> Email reminders
                before important dates
              </li>
              <li className="flex items-center gap-3 font-bold">
                <Check className="text-[#d9ff73]" size={18} /> Add properties
                and upgrade later
              </li>
            </ul>
            <p className="mt-7 text-[#cbd4c5] text-xs leading-5">
              LetDue organises records and reminders. It does not provide legal
              advice or guarantee compliance.
            </p>
          </section>

          <section className="p-7 md:p-10">
            <LockKeyhole className="text-[#52720d]" size={28} />
            <p className="mt-5 font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
              Account and checkout
            </p>
            <h2 className="mt-2 text-3xl">Create your LetDue account</h2>
            <p className="mt-3 text-[#65715d] leading-7">
              Set your login details now. The next screen is secure Stripe
              Checkout; LetDue never receives or stores your card details.
            </p>

            {error ? (
              <p className="mt-5 rounded-xl bg-[#ffe0d9] p-4 font-bold text-[#7a2514] text-sm leading-6">
                {error === "account"
                  ? "That account changed while checkout was starting. Sign in if you already registered, or try again."
                  : "Enter a valid email and matching passwords of at least 10 characters."}
              </p>
            ) : null}

            <form action={startPublicSignup} className="mt-6 space-y-4">
              <input name="propertyLimit" type="hidden" value={propertyLimit} />
              <input name="source" type="hidden" value={acquisitionSource} />
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
                  autoComplete="new-password"
                  className="mt-2 min-h-12 w-full rounded-xl border border-[#bcc7ae] px-4 font-normal"
                  minLength={10}
                  name="password"
                  required
                  type="password"
                />
              </label>
              <label className="block font-black text-sm">
                Confirm password
                <input
                  autoComplete="new-password"
                  className="mt-2 min-h-12 w-full rounded-xl border border-[#bcc7ae] px-4 font-normal"
                  minLength={10}
                  name="confirmPassword"
                  required
                  type="password"
                />
              </label>
              <button
                className="min-h-14 w-full rounded-xl bg-[#d9ff73] px-5 font-black text-[#18220d] shadow-sm"
                type="submit"
              >
                Create account and pay {moneyFromPence(plan.pricePence)}
              </button>
            </form>
            <p className="mt-4 text-center text-[#65715d] text-xs leading-5">
              By continuing, you agree to the{" "}
              <Link className="underline" href="/terms">
                terms
              </Link>{" "}
              and acknowledge the{" "}
              <Link className="underline" href="/privacy">
                privacy notice
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 border-[#e2e7db] border-t pt-5 text-sm">
              <Link className="font-black underline" href="/login">
                Already have an account?
              </Link>
              <Link
                className="font-black underline"
                href={`/?pack=${propertyLimit}&source=${acquisitionSource}#audit`}
              >
                Run the free audit instead
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
