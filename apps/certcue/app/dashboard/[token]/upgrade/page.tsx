import { ArrowLeft, Check, CreditCard, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { upgradePortfolio } from "@/app/dashboard/actions";
import { LetDueLogo } from "@/components/letdue-brand";
import {
  getUserByToken,
  hasActiveAccess,
  propertyLimitForUser,
} from "@/lib/data";
import { annualPricePenceForLimit, moneyFromPence } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function PortfolioUpgradePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ propertyLimit?: string }>;
}) {
  const { token } = await params;
  const { propertyLimit: requestedLimit } = await searchParams;
  const targetLimit = Number(requestedLimit);
  if (
    !/^[0-9a-f-]{36}$/i.test(token) ||
    !Number.isInteger(targetLimit) ||
    targetLimit < 4 ||
    targetLimit > 249
  ) {
    notFound();
  }

  const user = await getUserByToken(token);
  if (
    !user?.stripeCustomerId ||
    user.plan !== "paid" ||
    !hasActiveAccess(user) ||
    targetLimit <= propertyLimitForUser(user)
  ) {
    notFound();
  }

  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "active",
    limit: 10,
  });
  const subscription = subscriptions.data.find(
    (candidate) => candidate.items.data.length === 1,
  );
  const item = subscription?.items.data[0];
  if (!subscription || !item) notFound();

  const product =
    typeof item.price.product === "string"
      ? item.price.product
      : item.price.product.id;
  const prorationDate = Math.floor(Date.now() / 1000);
  const renewalPrice = annualPricePenceForLimit(targetLimit);
  const preview = await stripe.invoices.createPreview({
    customer: user.stripeCustomerId,
    subscription: subscription.id,
    subscription_details: {
      items: [
        {
          id: item.id,
          price_data: {
            currency: "gbp",
            product,
            unit_amount: renewalPrice,
            recurring: { interval: "year" },
          },
        },
      ],
      proration_behavior: "always_invoice",
      proration_date: prorationDate,
    },
  });
  const renewalDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
  }).format(new Date(item.current_period_end * 1000));

  return (
    <main className="min-h-screen bg-[#f4f5ef] px-4 py-8 md:py-14">
      <div className="mx-auto max-w-3xl">
        <a aria-label="LetDue home" href="/">
          <LetDueLogo />
        </a>
        <a
          className="mt-8 inline-flex items-center gap-2 font-bold text-[#526047]"
          href={`/dashboard/${token}#portfolio-plans`}
        >
          <ArrowLeft size={17} /> Back to your portfolio
        </a>

        <section className="mt-5 overflow-hidden rounded-3xl border border-[#d5dbc9] bg-white shadow-xl">
          <div className="bg-[#18220d] p-6 text-white md:p-9">
            <p className="font-black text-[#d9ff73] text-sm uppercase">
              Review your upgrade
            </p>
            <h1 className="mt-3 text-4xl leading-tight md:text-6xl">
              More room, from today.
            </h1>
            <p className="mt-4 max-w-2xl text-[#cbd4c5] text-lg leading-8">
              Check both amounts below. Nothing changes until you press the
              confirmation button.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-9">
            <div className="rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-5">
              <p className="font-black text-[#65715d] text-xs uppercase">
                Due today
              </p>
              <strong className="mt-2 block text-4xl">
                {moneyFromPence(Math.max(0, preview.amount_due))}
              </strong>
              <p className="mt-2 text-[#65715d] text-sm leading-6">
                Stripe’s exact prorated amount for the time remaining in this
                billing year.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-5">
              <p className="font-black text-[#65715d] text-xs uppercase">
                From {renewalDate}
              </p>
              <strong className="mt-2 block text-4xl">
                {moneyFromPence(renewalPrice)}
                <span className="text-base"> / year</span>
              </strong>
              <p className="mt-2 text-[#65715d] text-sm leading-6">
                Your new predictable annual renewal price.
              </p>
            </div>
          </div>

          <div className="border-[#d5dbc9] border-t px-6 pb-7 md:px-9 md:pb-9">
            <div className="grid gap-3 py-6 sm:grid-cols-2">
              <p className="flex items-center gap-2 font-bold">
                <Check className="text-[#52720d]" size={18} /> Current
                allowance: {propertyLimitForUser(user)}
              </p>
              <p className="flex items-center gap-2 font-bold">
                <Check className="text-[#52720d]" size={18} /> New allowance:{" "}
                {targetLimit} properties
              </p>
              <p className="flex items-center gap-2 font-bold">
                <ShieldCheck className="text-[#52720d]" size={18} /> Existing
                properties stay untouched
              </p>
              <p className="flex items-center gap-2 font-bold">
                <CreditCard className="text-[#52720d]" size={18} /> Secured by
                Stripe
              </p>
            </div>

            <form action={upgradePortfolio}>
              <input name="token" type="hidden" value={token} />
              <input name="propertyLimit" type="hidden" value={targetLimit} />
              <input name="prorationDate" type="hidden" value={prorationDate} />
              <button
                className="min-h-14 w-full rounded-xl bg-[#d9ff73] px-5 font-black text-[#18220d] text-lg"
                type="submit"
              >
                Confirm and pay{" "}
                {moneyFromPence(Math.max(0, preview.amount_due))}
                now
              </button>
            </form>
            <p className="mt-3 text-center text-[#65715d] text-xs leading-5">
              Your new property allowance activates only after Stripe confirms
              payment. This upgrade does not delete or change any property data.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
