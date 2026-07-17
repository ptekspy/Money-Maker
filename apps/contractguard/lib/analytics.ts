export type MarketingEvent = "checker_run" | "install_cta_clicked";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const storageKey = "contractguard-analytics-consent";
const endpoint = "https://app.apicontractguard.com/api/events";

export function trackEvent(
  event: MarketingEvent,
  properties: Record<string, string | number> = {},
) {
  if (window.localStorage.getItem(storageKey) !== "accepted") return;
  window.gtag?.("event", event, properties);
  void fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({
      event,
      source: "website",
      campaign:
        typeof properties.campaign === "string"
          ? properties.campaign
          : undefined,
    }),
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    keepalive: true,
  }).catch(() => undefined);
}
