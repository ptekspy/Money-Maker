"use client";

import { BellRing, CalendarDays } from "lucide-react";
import { useState } from "react";

type DeadlineCalculatorProps = {
  certificateName: string;
  source: string;
};

const reminderOffsets = [90, 30, 14, 7, 0] as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(date);
}

export function DeadlineCalculator({
  certificateName,
  source,
}: DeadlineCalculatorProps) {
  const [expiry, setExpiry] = useState("");
  const reminders = (() => {
    if (!expiry) return [];
    const dueDate = new Date(`${expiry}T12:00:00`);
    if (Number.isNaN(dueDate.getTime())) return [];
    return reminderOffsets.map((days) => {
      const date = new Date(dueDate);
      date.setDate(date.getDate() - days);
      return { days, date };
    });
  })();

  return (
    <section className="rounded-3xl bg-[#18220d] p-6 text-white shadow-2xl md:p-8">
      <div className="flex items-center gap-3">
        <CalendarDays className="text-[#d9ff73]" size={28} />
        <h2 className="text-2xl">Plan your reminder dates</h2>
      </div>
      <label className="mt-6 grid gap-2 font-bold">
        {certificateName} expiry date
        <input
          className="min-h-13 rounded-lg border border-white/20 bg-white px-3 font-normal text-[#18220d]"
          type="date"
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
        />
      </label>
      {reminders.length ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-white/15">
          {reminders.map(({ days, date }) => (
            <div
              className="flex items-center justify-between gap-4 border-white/10 border-b px-4 py-3 last:border-0"
              key={days}
            >
              <span className="font-bold">
                {days === 0 ? "Due date" : `${days}-day warning`}
              </span>
              <span className="text-[#d9ff73]">{formatDate(date)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-[#cbd4c5] leading-7">
          Enter the expiry date printed on the certificate to see the five dates
          LetDue can put on watch.
        </p>
      )}
      <a
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#d9ff73] px-5 font-black text-[#18220d]"
        href={`/?source=${source}#audit`}
      >
        <BellRing size={18} /> Track this property free
      </a>
      <p className="mt-3 text-center text-[#aeb9a7] text-xs">
        14-day pilot Â· no card Â· Â£29/year afterwards
      </p>
    </section>
  );
}
