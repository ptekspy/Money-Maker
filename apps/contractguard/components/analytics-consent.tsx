"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const measurementId = "G-25LT97E203";
const storageKey = "contractguard-analytics-consent";

type Consent = "accepted" | "declined" | "pending";

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent>("pending");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "accepted" || saved === "declined") {
      setConsent(saved);
    }
  }, []);

  function choose(value: Exclude<Consent, "pending">) {
    window.localStorage.setItem(storageKey, value);
    setConsent(value);
  }

  return (
    <>
      {consent === "accepted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="contractguard-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {consent === "pending" ? (
        <aside className="consent" aria-label="Analytics preferences">
          <div>
            <strong>Help us improve API Contract Guard</strong>
            <p>
              We use optional Google Analytics cookies to measure which pages
              help visitors. Essential product functions work without them.
            </p>
          </div>
          <div className="consent-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => choose("declined")}
            >
              Decline
            </button>
            <button
              type="button"
              className="button primary"
              onClick={() => choose("accepted")}
            >
              Accept analytics
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
