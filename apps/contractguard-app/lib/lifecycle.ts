import {
  getUserProfile,
  type Installation,
  listRecentChecks,
} from "@/lib/data";
import { sendEmailOnce } from "@/lib/email";

const appUrl = "https://app.apicontractguard.com/dashboard";

function daysLeft(value: string) {
  return Math.ceil((Date.parse(value) - Date.now()) / 86400000);
}

async function recipient(installation: Installation) {
  if (!installation.installerUserId) return null;
  return getUserProfile(installation.installerUserId);
}

export async function sendLifecycleEmail(installation: Installation) {
  const user = await recipient(installation);
  if (!user?.email) return false;
  const ownerKey = `INSTALLATION#${installation.installationId}`;
  const checks = await listRecentChecks(installation.installationId);
  const ageHours =
    (Date.now() - Date.parse(installation.createdAt)) / (60 * 60 * 1000);
  const remaining = daysLeft(installation.trialEndsAt);

  if (ageHours < 24) {
    return sendEmailOnce({
      ownerKey,
      kind: "installation_welcome",
      to: user.email,
      subject: "API Contract Guard is connected",
      text: `Hi ${user.login},\n\nAPI Contract Guard is connected to ${installation.accountLogin}.\n\nNext, open a pull request that changes an OpenAPI YAML or JSON file. The first compatibility check will appear directly on the pull request.\n\nFounding offer: activate Starter for £1 for the first month, then £19/month. Cancel any time.\n\nOpen your dashboard: ${appUrl}\n\nAPI Contract Guard`,
    });
  }

  if (!checks.length && ageHours >= 24) {
    const sent = await sendEmailOnce({
      ownerKey,
      kind: "first_check_reminder",
      to: user.email,
      subject: "Run your first OpenAPI pull-request check",
      text: `Hi ${user.login},\n\nYour GitHub App is installed, but no OpenAPI pull-request check has run yet.\n\nChange an openapi.yaml, openapi.yml or openapi.json file on a branch and open a pull request. Contract Guard will compare it with the base branch automatically.\n\nFounding offer: activate Starter for £1 for the first month, then £19/month. Cancel any time.\n\nOpen your dashboard: ${appUrl}\n\nAPI Contract Guard`,
    });
    if (sent) return true;
  }

  if (installation.billingStatus !== "trialing") return false;
  if (remaining <= 0) {
    return sendEmailOnce({
      ownerKey,
      kind: "trial_ended",
      to: user.email,
      subject: "Your API Contract Guard trial has ended",
      text: `Hi ${user.login},\n\nYour API Contract Guard trial has ended. Existing results remain visible, but new pull-request protection requires activation.\n\nFounding offer: activate Starter for £1 for the first month, then £19/month. Cancel any time.\n\nActivate protection: ${appUrl}\n\nAPI Contract Guard`,
    });
  }
  if (remaining <= 1) {
    return sendEmailOnce({
      ownerKey,
      kind: "trial_1_day",
      to: user.email,
      subject: "One day left on your API Contract Guard trial",
      text: `Hi ${user.login},\n\nThere is one day left on the trial for ${installation.accountLogin}. Activate protection to keep automated OpenAPI checks running.\n\nFounding offer: your first Starter month is £1, then £19/month. Cancel any time.\n\nActivate protection: ${appUrl}\n\nAPI Contract Guard`,
    });
  }
  if (remaining <= 3) {
    return sendEmailOnce({
      ownerKey,
      kind: "trial_3_days",
      to: user.email,
      subject: "Three days left on your API Contract Guard trial",
      text: `Hi ${user.login},\n\nThere are ${remaining} days left on the trial for ${installation.accountLogin}. Your dashboard shows the repositories and checks currently protected.\n\nFounding offer: your first Starter month is £1, then £19/month. Cancel any time.\n\nReview protection: ${appUrl}\n\nAPI Contract Guard`,
    });
  }
  return false;
}
