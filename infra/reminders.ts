import { runReminders } from "../apps/certcue/lib/run-reminders";

export async function handler() {
  return runReminders();
}
