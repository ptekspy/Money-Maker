import { ArrowRight, Check, Sparkles } from "lucide-react";
import {
  annualPricePenceForLimit,
  moneyFromPence,
  portfolioPlans,
} from "@/lib/pricing";

export function PortfolioPlans({
  currentLimit,
  token,
}: {
  currentLimit?: number;
  token?: string;
}) {
  const isDashboard = Boolean(token && currentLimit);
  const nextLimit = currentLimit ? Math.min(currentLimit + 1, 249) : null;

  return (
    <section
      className={
        isDashboard
          ? "mt-8 rounded-3xl border border-[#d5dbc9] bg-[#f7f8f3] p-5 md:p-8"
          : "bg-[#18220d] px-4 py-16 text-white md:px-8 md:py-24"
      }
      id={isDashboard ? "portfolio-plans" : "pricing"}
    >
      <div className={isDashboard ? "" : "mx-auto max-w-7xl"}>
        <div className="max-w-3xl">
          <p
            className={`font-black text-sm uppercase ${isDashboard ? "text-[#52720d]" : "text-[#d9ff73]"}`}
          >
            Simple annual pricing
          </p>
          <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
            One portfolio. One predictable price.
          </h2>
          <p
            className={`mt-4 text-lg leading-8 ${isDashboard ? "text-[#526047]" : "text-[#cbd4c5]"}`}
          >
            Start with three properties and move up whenever you need to.
            Upgrades are prorated, so you pay only for the time left in your
            current billing year.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {portfolioPlans.map((plan) => {
            const isCurrent = currentLimit === plan.propertyLimit;
            const cannotDowngrade = Boolean(
              currentLimit && plan.propertyLimit < currentLimit,
            );
            const cardClass = plan.popular
              ? isDashboard
                ? "relative flex h-full flex-col rounded-2xl bg-[#18220d] p-6 text-white shadow-xl ring-4 ring-[#d9ff73]"
                : "relative flex h-full flex-col rounded-2xl bg-white p-6 text-[#18220d] shadow-2xl ring-4 ring-[#d9ff73]"
              : isDashboard
                ? "relative flex h-full flex-col rounded-2xl border border-[#d5dbc9] bg-white p-6 text-[#18220d]"
                : "relative flex h-full flex-col rounded-2xl border border-white/20 bg-[#26351a] p-6 text-white";

            return (
              <article
                className={`${cardClass} ${plan.popular ? "order-first xl:order-none" : ""}`}
                key={plan.propertyLimit}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-[#d9ff73] px-3 py-1 font-black text-[#18220d] text-xs uppercase">
                    <Sparkles size={13} /> Most popular
                  </span>
                ) : null}
                <p
                  className={`font-black text-sm uppercase ${plan.popular && isDashboard ? "text-[#d9ff73]" : "text-[#8ca07d]"}`}
                >
                  {plan.name}
                </p>
                <p className="mt-3">
                  <strong className="text-4xl tracking-tight">
                    {moneyFromPence(plan.pricePence)}
                  </strong>
                  <span className="font-bold opacity-65"> / year</span>
                </p>
                <p className="mt-2 font-black text-lg">
                  Up to {plan.propertyLimit} properties
                </p>
                <p className="mt-3 min-h-18 text-sm leading-6 opacity-70">
                  {plan.description}
                </p>
                <ul className="mt-5 grid gap-2 border-current/15 border-t pt-5 text-sm">
                  <li className="flex items-center gap-2 font-bold">
                    <Check className="text-[#6f941b]" size={17} /> All reminder
                    and document features
                  </li>
                  {plan.savingPence ? (
                    <li className="flex items-center gap-2 font-bold">
                      <Check className="text-[#6f941b]" size={17} /> Save{" "}
                      {moneyFromPence(plan.savingPence)} every year
                    </li>
                  ) : (
                    <li className="flex items-center gap-2 font-bold">
                      <Check className="text-[#6f941b]" size={17} /> No setup
                      fee
                    </li>
                  )}
                </ul>
                <div className="mt-auto pt-6">
                  {isDashboard && token ? (
                    isCurrent || cannotDowngrade ? (
                      <button
                        className={`min-h-12 w-full rounded-lg px-4 font-black ${plan.popular && !isCurrent && !cannotDowngrade ? "bg-[#d9ff73] text-[#18220d]" : "border border-current/25 bg-transparent"} disabled:cursor-not-allowed disabled:opacity-45`}
                        disabled
                        type="submit"
                      >
                        {isCurrent
                          ? "Your current plan"
                          : cannotDowngrade
                            ? "Downgrade at renewal"
                            : `Upgrade to ${plan.propertyLimit}`}
                      </button>
                    ) : (
                      <a
                        className={`inline-flex min-h-12 w-full items-center justify-center rounded-lg px-4 font-black ${plan.popular ? "bg-[#d9ff73] text-[#18220d]" : "border border-current/25 bg-transparent"}`}
                        href={`/dashboard/${token}/upgrade?propertyLimit=${plan.propertyLimit}`}
                      >
                        Review upgrade to {plan.propertyLimit}
                      </a>
                    )
                  ) : (
                    <a
                      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 font-black ${plan.popular ? "bg-[#d9ff73] text-[#18220d]" : "border border-current/30"}`}
                      href={`/?pack=${plan.propertyLimit}&source=pricing-${plan.propertyLimit}#audit`}
                    >
                      Choose {plan.propertyLimit} <ArrowRight size={17} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div
          className={`mt-6 grid gap-4 rounded-2xl border p-5 md:grid-cols-[1fr_auto] md:items-center ${isDashboard ? "border-[#d5dbc9] bg-white" : "border-white/20 bg-white/5"}`}
        >
          <div>
            <strong className="text-lg">
              Need a number between packs? Add properties one at a time for £5
              per year.
            </strong>
            <p className="mt-1 text-sm opacity-70">
              We show the prorated amount due today before you confirm. Your
              next renewal then includes the full annual amount.
            </p>
          </div>
          {isDashboard && token && nextLimit && (currentLimit ?? 250) < 249 ? (
            <a
              className="min-h-12 rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
              href={`/dashboard/${token}/upgrade?propertyLimit=${nextLimit}`}
            >
              Add property · renewal becomes{" "}
              {moneyFromPence(annualPricePenceForLimit(nextLimit))}
            </a>
          ) : (
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
              href="#contact"
            >
              250+ properties? Contact sales <ArrowRight size={17} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
