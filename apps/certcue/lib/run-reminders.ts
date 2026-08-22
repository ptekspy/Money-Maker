import {
  claimReminder,
  getProperty,
  getUser,
  hasActiveAccess,
  listCertificatesDue,
  listPilotsEnding,
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
    if (!user || !property || !hasActiveAccess(user, now)) continue;
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
  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL ?? "https://letdue.com";
  const pilotIntervals = [7, 3, 0];
  let pilotDue = 0;
  let pilotSent = 0;

  for (const daysLeft of pilotIntervals) {
    const endDate = new Date(now);
    endDate.setUTCDate(endDate.getUTCDate() + daysLeft);
    const pilots = await listPilotsEnding(isoDate(endDate));
    pilotDue += pilots.length;
    for (const user of pilots) {
      if (user.plan !== "pilot" || !hasActiveAccess(user, now)) continue;
      const reminderDate = isoDate(now);
      if (!(await claimReminder(`pilot:${user.id}`, reminderDate))) continue;
      const timing = daysLeft === 0 ? "ends today" : `ends in ${daysLeft} days`;
      try {
        await sendEmail({
          to: user.email,
          subject: `Your LetDue pilot ${timing}`,
          text: `Your LetDue pilot ${timing}.

If the reminders are useful, keep monitoring up to three properties for £29/year:
${appUrl}/dashboard/${user.accessToken}

Choose "Continue monitoring" on your dashboard to move to the founding plan.

No action is needed if you do not want to continue.

LetDue organises documents, dates and reminders. It does not provide legal advice or guarantee compliance.`,
        });
        pilotSent += 1;
      } catch (error) {
        await releaseReminder(`pilot:${user.id}`, reminderDate);
        throw error;
      }
    }
  }

  return { due: due.length, sent, pilotDue, pilotSent };
}
