const endpoints = [
  "https://apicontractguard.com",
  "https://app.apicontractguard.com",
];

for (const endpoint of endpoints) {
  const response = await fetch(endpoint, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${endpoint} returned HTTP ${response.status}`);
  }
  console.log(`${endpoint}: ${response.status}`);
}

const healthResponse = await fetch(
  "https://app.apicontractguard.com/api/system/health",
);
if (!healthResponse.ok) {
  throw new Error(`Health endpoint returned HTTP ${healthResponse.status}`);
}

const health = await healthResponse.json();
const required = {
  ok: health.ok,
  githubAppConfigured: health.githubAppConfigured,
  webhookSecretConfigured: health.webhookSecretConfigured,
  stripeSecretKey: health.stripe?.secretKey,
  stripeWebhookSecret: health.stripe?.webhookSecret,
  stripeStarterPriceId: health.stripe?.starterPriceId,
  stripeProPriceId: health.stripe?.proPriceId,
  stripeTeamsPriceId: health.stripe?.teamsPriceId,
  stripeTeamsSeatPriceId: health.stripe?.teamsSeatPriceId,
};

const missing = Object.entries(required)
  .filter(([, value]) => value !== true)
  .map(([name]) => name);
if (missing.length) {
  throw new Error(`Health checks failed: ${missing.join(", ")}`);
}

console.log("All API Contract Guard health checks passed.");
