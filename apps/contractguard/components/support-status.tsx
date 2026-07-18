"use client";

import { useSearchParams } from "next/navigation";

export function SupportStatus() {
  const searchParams = useSearchParams();
  const status = searchParams.get("support");
  const message =
    status === "sent"
      ? "Thanks — your message has been sent to support."
      : status === "error"
        ? "Something went wrong. Please email support@apicontractguard.com directly."
        : null;

  return message ? <div className="formNotice">{message}</div> : null;
}
