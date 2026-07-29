"use client";

import { useEffect, useState } from "react";
import { sendInAppSupport } from "@/app/actions/contact";

export function SupportForm({
  token,
  sent,
}: {
  token: string;
  sent?: boolean;
}) {
  const [context, setContext] = useState({
    pageUrl: "",
    userAgent: "",
    timezone: "",
    language: "",
    screen: "",
  });

  useEffect(() => {
    setContext({
      pageUrl: window.location.href,
      userAgent: window.navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: window.navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
    });
  }, []);

  return (
    <section
      className="mt-8 rounded-2xl border border-[#d5dbc9] bg-[#f7f8f3] p-5"
      id="support"
    >
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="font-black text-[#52720d] text-xs uppercase">Support</p>
          <h2 className="mt-1 text-2xl">Need help with this account?</h2>
          <p className="mt-2 text-[#65715d] leading-7">
            Send a private support note from inside your dashboard. LetDue will
            include account, portfolio and browser context so you do not have to
            explain which install or property dashboard is affected.
          </p>
        </div>
        <form action={sendInAppSupport} className="rounded-xl bg-white p-4">
          {sent ? (
            <p className="mb-4 rounded-xl bg-[#dff5d8] p-4 font-bold text-[#26531b]">
              Support request sent. We will reply by email.
            </p>
          ) : null}
          <input name="token" type="hidden" value={token} />
          <input name="pageUrl" type="hidden" value={context.pageUrl} />
          <input name="userAgent" type="hidden" value={context.userAgent} />
          <input name="timezone" type="hidden" value={context.timezone} />
          <input name="language" type="hidden" value={context.language} />
          <input name="screen" type="hidden" value={context.screen} />
          <label className="grid gap-1 font-bold text-sm">
            Subject
            <input
              className="min-h-11 rounded-lg border border-[#bcc7ae] px-3 font-normal"
              name="subject"
              placeholder="e.g. I cannot read an EICR PDF"
              required
            />
          </label>
          <label className="mt-3 grid gap-1 font-bold text-sm">
            What happened?
            <textarea
              className="min-h-32 rounded-lg border border-[#bcc7ae] p-3 font-normal"
              name="message"
              placeholder="Tell us what you expected, what happened, and which property or certificate it relates to."
              required
            />
          </label>
          <label className="hidden">
            Website
            <input autoComplete="off" name="website" tabIndex={-1} />
          </label>
          <button
            className="mt-4 min-h-11 rounded-lg bg-[#18220d] px-4 font-black text-white"
            type="submit"
          >
            Send support request
          </button>
        </form>
      </div>
    </section>
  );
}
