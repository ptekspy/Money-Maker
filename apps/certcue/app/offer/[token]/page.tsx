import { CheckCircle2, LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { acceptCustomerPackage } from "@/app/actions/offer";
import { LetDueLogo } from "@/components/letdue-brand";
import { getOfferByTokenHash } from "@/lib/data";
import { getStripe } from "@/lib/stripe";
import { hashUserToken } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your private package | LetDue",
  robots: { index: false, follow: false },
};

function money(pricePence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pricePence / 100);
}

export default async function OfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; checkout?: string }>;
}) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) notFound();
  const offer = await getOfferByTokenHash(hashUserToken(token));
  const { error, checkout } = await searchParams;

  let checkoutUrl: string | null = null;
  if (offer?.status === "accepted" && offer.checkoutSessionId) {
    const session = await getStripe().checkout.sessions.retrieve(
      offer.checkoutSessionId,
    );
    checkoutUrl = session.status === "open" ? session.url : null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 md:px-8 md:py-16">
      <Link aria-label="LetDue home" href="/">
        <LetDueLogo />
      </Link>

      {!offer ? (
        <section className="mt-10 max-w-xl rounded-3xl border border-[#d5dbc9] bg-white p-8">
          <p className="font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
            Private package
          </p>
          <h1 className="mt-3 text-4xl">This link has expired.</h1>
          <p className="mt-4 text-[#65715d] leading-7">
            Ask the LetDue team to send a fresh package link to your email.
          </p>
          <a
            className="mt-6 inline-block font-black underline"
            href="mailto:hello@letdue.com"
          >
            Email hello@letdue.com
          </a>
        </section>
      ) : offer.status === "paid" ? (
        <section className="mt-10 max-w-xl rounded-3xl border border-[#d5dbc9] bg-white p-8">
          <CheckCircle2 className="text-[#52720d]" size={28} />
          <h1 className="mt-5 text-4xl">Your package is active.</h1>
          <p className="mt-4 text-[#65715d] leading-7">
            Sign in with the password you created to open your LetDue account.
          </p>
          <Link
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[#18220d] px-5 font-black text-white"
            href="/login"
          >
            Sign in to LetDue
          </Link>
        </section>
      ) : checkoutUrl ? (
        <section className="mt-10 max-w-xl rounded-3xl border border-[#d5dbc9] bg-white p-8">
          <LockKeyhole className="text-[#52720d]" size={28} />
          <h1 className="mt-5 text-4xl">Your password is ready.</h1>
          <p className="mt-4 text-[#65715d] leading-7">
            Continue to Stripe to activate monitoring for up to{" "}
            {offer.propertyLimit} properties at {money(offer.pricePence)} per
            year.
          </p>
          {checkout ? (
            <p className="mt-5 rounded-xl bg-[#fff0bd] p-4 font-bold text-[#684c00]">
              Checkout was cancelled. Nothing was charged.
            </p>
          ) : null}
          <a
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[#18220d] px-5 font-black text-white"
            href={checkoutUrl}
          >
            Continue to secure checkout
          </a>
        </section>
      ) : (
        <div className="mt-10 grid gap-7 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-3xl bg-[#18220d] p-7 text-white md:p-10">
            <p className="font-black text-[#d9ff73] text-xs uppercase tracking-[0.16em]">
              Prepared for {offer.email}
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl">Your LetDue package</h1>
            <div className="mt-8 rounded-2xl bg-[#26331e] p-6">
              <strong className="text-4xl">{money(offer.pricePence)}</strong>
              <span className="text-[#cbd4c5]"> / year</span>
              <ul className="mt-6 space-y-3 text-[#eef0e7]">
                <li>Up to {offer.propertyLimit} properties</li>
                <li>Certificate storage and deadline tracking</li>
                <li>Email reminders before important dates</li>
                <li>Secure Stripe subscription checkout</li>
              </ul>
            </div>
            <p className="mt-6 text-[#cbd4c5] text-sm leading-6">
              LetDue organises records and reminders. It does not provide legal
              advice or guarantee compliance.
            </p>
          </section>

          <section className="rounded-3xl border border-[#d5dbc9] bg-white p-7 md:p-10">
            <LockKeyhole className="text-[#52720d]" size={28} />
            <h2 className="mt-5 text-3xl">Create your password</h2>
            <p className="mt-3 text-[#65715d] leading-7">
              After this step you will go directly to Stripe Checkout. LetDue
              never receives or stores your card details.
            </p>
            {error ? (
              <p className="mt-5 rounded-xl bg-[#ffe0d9] p-4 font-bold text-[#7a2514] text-sm">
                Use at least 10 characters and enter the same password twice.
              </p>
            ) : null}
            <form action={acceptCustomerPackage} className="mt-6 space-y-4">
              <input name="token" type="hidden" value={token} />
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
                className="min-h-12 w-full rounded-xl bg-[#d9ff73] px-5 font-black text-[#18220d]"
                type="submit"
              >
                Create password and continue
              </button>
            </form>
            <p className="mt-4 text-[#65715d] text-xs leading-5">
              This offer link expires seven days after it was sent.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
