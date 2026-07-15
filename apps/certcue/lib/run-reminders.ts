import {
  claimReminder,
  getProperty,
  getUser,
  listCertificatesDue,
  releaseReminder,
} from "./data";
import { sendEmail } from "./email";

export async function runReminders(now = new Date()) {
  const isoDate = (date: Date) => date.toISOString().slice(0, 10);
  const intervals = [90, 30, 14, 7, 0];
  const dueGroups = await Promise.all(
    intervals.map(async (daysLeft) => {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() + daysLeft);
      const certificates = await listCertificatesDue(isoDate(date));
      return certificates.map((certificate) => ({ certificate, daysLeft }));
    }),
  );
  const due = dueGroups.flat();
  let sent = 0;

  for (const { certificate, daysLeft } of due) {
    const user = await getUser(certificate.userId);
    const property = await getProperty(
      certificate.userId,
      certificate.propertyId,
    );
    if (!user || !property || user.subscriptionStatus !== "active") continue;
    const reminderDate = isoDate(now);
    if (!(await claimReminder(certificate.id, reminderDate))) continue;
    const timing =
      daysLeft === 0 ? "expires today" : `expires in ${daysLeft} days`;
    try {
      await sendEmail({
        to: user.email,
        subject: `${certificate.kind} ${timing} — ${property.address}`,
        text: `${certificate.kind} for ${property.address} ${timing} (${certificate.expiryDate}).\n\nOpen your LetDue dashboard to update the certificate after renewal.`,
      });
      sent += 1;
    } catch (error) {
      await releaseReminder(certificate.id, reminderDate);
      throw error;
    }
  }
  return { due: due.length, sent };
}
