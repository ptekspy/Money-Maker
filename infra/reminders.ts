export async function handler() {
  const baseUrl = process.env.LANDLORD_SAAS_URL;
  const secret = process.env.CRON_SECRET;

  if (!baseUrl || !secret) {
    throw new Error("Reminder scheduler configuration is incomplete");
  }

  const response = await fetch(`${baseUrl}/api/cron/reminders`, {
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Reminder run failed with status ${response.status}`);
  }

  return response.json();
}
