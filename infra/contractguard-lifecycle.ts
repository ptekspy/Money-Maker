import {
  listAllInstallations,
  listFunnelEventsSince,
} from "../apps/contractguard-app/lib/data";
import { sendEmail } from "../apps/contractguard-app/lib/email";
import { sendLifecycleEmail } from "../apps/contractguard-app/lib/lifecycle";

export async function daily() {
  const installations = await listAllInstallations(500);
  const results = await Promise.allSettled(
    installations.map((installation) => sendLifecycleEmail(installation)),
  );
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length) {
    console.error("Contract Guard lifecycle email failures", {
      failed: failed.length,
    });
    throw new Error(`${failed.length} lifecycle email jobs failed`);
  }
  return {
    installations: installations.length,
    sent: results.filter(
      (result) => result.status === "fulfilled" && result.value,
    ).length,
  };
}

function count(
  events: Awaited<ReturnType<typeof listFunnelEventsSince>>,
  type: string,
) {
  return events.filter((event) => event.type === type).length;
}

export async function weekly() {
  const since = new Date(Date.now() - 7 * 86400000);
  const events = await listFunnelEventsSince(since);
  const checkerRuns = count(events, "checker_run");
  const ctaClicks = count(events, "install_cta_clicked");
  const signIns = count(events, "github_sign_in");
  const installs = count(events, "installation_created");
  const checks = count(events, "check_completed");
  const checkouts = count(events, "checkout_started");
  const subscriptions = count(events, "subscription_activated");
  const sources = Object.entries(
    events.reduce<Record<string, number>>((totals, event) => {
      const source = event.campaign || event.source || "direct";
      totals[source] = (totals[source] ?? 0) + 1;
      return totals;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([source, total]) => `- ${source}: ${total}`)
    .join("\n");

  await sendEmail({
    to: process.env.CONTRACTGUARD_REPORT_EMAIL ?? "admin@apicontractguard.com",
    subject: `API Contract Guard weekly funnel: ${installs} installs, ${subscriptions} paid`,
    text: `API Contract Guard weekly funnel\n${since.toISOString().slice(0, 10)} to ${new Date().toISOString().slice(0, 10)}\n\nFree checker runs: ${checkerRuns}\nInstall CTA clicks: ${ctaClicks}\nGitHub sign-ins: ${signIns}\nGitHub App installs: ${installs}\nChecks completed: ${checks}\nCheckout sessions started: ${checkouts}\nSubscriptions activated: ${subscriptions}\n\nTop sources and campaigns\n${sources || "- No attributed events yet"}\n\nLive operator dashboard: https://app.apicontractguard.com/admin\n`,
  });
  return { events: events.length, installs, subscriptions };
}
