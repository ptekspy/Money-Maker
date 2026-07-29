import { sendPublicContact } from "@/app/actions/contact";

export function ContactForm({ sent }: { sent?: boolean }) {
  return (
    <section
      className="border-[#d5dbc9] border-t bg-[#f7f8f3] px-4 py-16 md:px-8 md:py-24"
      id="contact"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="font-black text-[#52720d] text-sm uppercase">
            Talk to the founder
          </p>
          <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
            Have a question before you trust us with a deadline?
          </h2>
          <p className="mt-4 max-w-xl text-[#526047] text-lg leading-8">
            Ask about the free audit, certificate types, reminders or whether
            LetDue is a fit for your property setup. You will get a human reply,
            not a sales sequence.
          </p>
          <a
            className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
            href="/founding-plan?source=contact"
          >
            I want to pay and get set up
          </a>
        </div>
        <form
          action={sendPublicContact}
          className="rounded-2xl border border-[#d5dbc9] bg-white p-5 shadow-sm"
        >
          {sent ? (
            <p className="mb-4 rounded-xl bg-[#dff5d8] p-4 font-bold text-[#26531b]">
              Thanks — your message has been sent.
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 font-bold text-sm">
              Name
              <input
                className="min-h-12 rounded-lg border border-[#bcc7ae] px-3 font-normal"
                name="name"
                required
              />
            </label>
            <label className="grid gap-1 font-bold text-sm">
              Email
              <input
                className="min-h-12 rounded-lg border border-[#bcc7ae] px-3 font-normal"
                name="email"
                required
                type="email"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-1 font-bold text-sm">
            I am a...
            <select
              className="min-h-12 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
              name="role"
            >
              <option value="">Choose one</option>
              <option>Self-managing landlord</option>
              <option>Letting agent</option>
              <option>Certificate provider</option>
              <option>Landlord association or community</option>
              <option>Other</option>
            </select>
          </label>
          <label className="mt-4 grid gap-1 font-bold text-sm">
            What do you need?
            <select
              className="min-h-12 rounded-lg border border-[#bcc7ae] bg-white px-3 font-normal"
              name="intent"
            >
              <option value="">Choose one</option>
              <option>I want to pay and get set up</option>
              <option>I want to try the free audit first</option>
              <option>I have a partner/referral question</option>
              <option>I need help deciding if LetDue fits</option>
              <option>Other</option>
            </select>
          </label>
          <label className="mt-4 grid gap-1 font-bold text-sm">
            Message
            <textarea
              className="min-h-36 rounded-lg border border-[#bcc7ae] p-3 font-normal"
              name="message"
              placeholder="Tell me what you are trying to track, or what would make LetDue useful enough to pay for."
              required
            />
          </label>
          <label className="hidden">
            Website
            <input autoComplete="off" name="website" tabIndex={-1} />
          </label>
          <button
            className="mt-5 min-h-12 rounded-lg bg-[#18220d] px-5 font-black text-white"
            type="submit"
          >
            Send message
          </button>
          <p className="mt-3 text-[#6e7967] text-sm leading-6">
            Please do not paste tenant personal data or private certificate
            files into this form.
          </p>
        </form>
      </div>
    </section>
  );
}
