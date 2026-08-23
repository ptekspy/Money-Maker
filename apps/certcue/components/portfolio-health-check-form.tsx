import { sendPortfolioHealthCheck } from "@/app/actions/contact";

const certificateTypes = [
  "Gas safety",
  "EICR",
  "EPC",
  "Landlord insurance",
  "Property licences",
] as const;

export function PortfolioHealthCheckForm({
  acquisitionSource,
  status,
}: {
  acquisitionSource?: string;
  status?: "sent" | "error";
}) {
  return (
    <section
      className="border-[#d5dbc9] border-y bg-white px-4 py-14 md:px-8 md:py-20"
      id="portfolio-review"
    >
      <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="font-black text-[#52720d] text-sm uppercase">
            Free portfolio health check
          </p>
          <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
            Show us how you track the dates today.
          </h2>
          <p className="mt-4 text-[#526047] text-lg leading-8">
            Patrick will review the shape of your portfolio and reply with the
            simplest sensible LetDue setup. No sales sequence and no obligation
            to buy.
          </p>
          <div className="mt-6 rounded-2xl bg-[#f2f7e7] p-5 text-[#394430]">
            <strong>Do not send certificates or tenant details.</strong>
            <p className="mt-2 leading-7">
              We only need the number of properties, the records you track and
              what currently makes the admin difficult.
            </p>
          </div>
        </div>

        <form
          action={sendPortfolioHealthCheck}
          className="rounded-3xl border border-[#d5dbc9] bg-[#f7f8f3] p-5 shadow-sm md:p-7"
        >
          <input
            name="acquisitionSource"
            type="hidden"
            value={acquisitionSource ?? "portfolio-health-check"}
          />
          {status === "sent" ? (
            <div className="rounded-2xl bg-[#dff5d8] p-5 text-[#26531b]">
              <h3 className="text-2xl">Your review request is in.</h3>
              <p className="mt-2 leading-7">
                Patrick will reply personally. If you already know the pack you
                need, you can continue straight to pricing below.
              </p>
              <a
                className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-[#18220d] px-5 font-black text-white"
                href="/portfolio-certificate-tracking#pricing"
              >
                Compare portfolio plans
              </a>
            </div>
          ) : (
            <>
              {status === "error" ? (
                <p className="mb-5 rounded-xl bg-[#ffe0d9] p-4 font-bold text-[#7a2514]">
                  Check the required fields and try again.
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1 font-bold text-sm">
                  Name
                  <input
                    className="min-h-12 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                    name="name"
                    required
                  />
                </label>
                <label className="grid gap-1 font-bold text-sm">
                  Email
                  <input
                    className="min-h-12 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                    name="email"
                    required
                    type="email"
                  />
                </label>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="grid gap-1 font-bold text-sm">
                  Number of rental properties
                  <input
                    className="min-h-12 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                    max={10000}
                    min={1}
                    name="propertyCount"
                    required
                    type="number"
                  />
                </label>
                <label className="grid gap-1 font-bold text-sm">
                  How do you track dates now?
                  <select
                    className="min-h-12 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                    name="trackingMethod"
                    required
                  >
                    <option value="">Choose one</option>
                    <option>Spreadsheet</option>
                    <option>Calendar reminders</option>
                    <option>Property-management software</option>
                    <option>Email and document folders</option>
                    <option>Memory or no consistent system</option>
                    <option>Something else</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 grid gap-1 font-bold text-sm">
                What causes the most difficulty?
                <select
                  className="min-h-12 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
                  name="biggestProblem"
                  required
                >
                  <option value="">Choose one</option>
                  <option>Dates are spread across too many places</option>
                  <option>Renewals are noticed too late</option>
                  <option>Certificates are hard to find</option>
                  <option>Adding properties makes the spreadsheet messy</option>
                  <option>Existing software is too broad or expensive</option>
                  <option>Another admin problem</option>
                </select>
              </label>
              <fieldset className="mt-5">
                <legend className="font-bold text-sm">
                  Records you want to keep on watch
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {certificateTypes.map((type) => (
                    <label
                      className="flex min-h-12 items-center gap-3 rounded-lg border border-[#d5dbc9] bg-white px-3 font-bold text-sm"
                      key={type}
                    >
                      <input
                        defaultChecked={type === "Gas safety"}
                        name="certificateTypes"
                        type="checkbox"
                        value={type}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="mt-4 grid gap-1 font-bold text-sm">
                Anything else we should know? (optional)
                <textarea
                  className="min-h-28 rounded-lg border border-[#bcc7ae] bg-white p-3 font-normal"
                  maxLength={1500}
                  name="message"
                  placeholder="For example: we manage HMOs, use several contractors, or need to migrate an existing sheet."
                />
              </label>
              <label className="hidden">
                Website
                <input autoComplete="off" name="website" tabIndex={-1} />
              </label>
              <button
                className="mt-5 min-h-13 w-full rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
                type="submit"
              >
                Request my free portfolio review
              </button>
              <p className="mt-3 text-[#6e7967] text-xs leading-5">
                This is an organisational review, not legal or compliance
                advice. Your details are used to answer this request.
              </p>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
