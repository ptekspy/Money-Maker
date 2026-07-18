import { NextRequest, NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import {
  getInstallation,
  getUserProfile,
  recordOperationalEvent,
} from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { userInstallations } from "@/lib/github";

const supportEmail = "support@apicontractguard.com";

function clean(value: FormDataEntryValue | null, max = 1000) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

function redirectTo(request: NextRequest, target: string, fallback: string) {
  try {
    const url = new URL(target || fallback, request.url);
    if (
      url.hostname === "apicontractguard.com" ||
      url.hostname === "app.apicontractguard.com" ||
      url.hostname === request.nextUrl.hostname
    ) {
      return url;
    }
  } catch {
    // Fall through to the safe default.
  }
  return new URL(fallback, request.url);
}

function withStatus(url: URL, status: "sent" | "error") {
  url.searchParams.set("support", status);
  return url;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const source = clean(form.get("source"), 24) || "public";
  const returnTo = clean(form.get("returnTo"), 500);
  const fallback =
    source === "internal"
      ? "https://app.apicontractguard.com/dashboard"
      : "https://apicontractguard.com/support";
  const successUrl = withStatus(
    redirectTo(request, returnTo, fallback),
    "sent",
  );
  const errorUrl = withStatus(redirectTo(request, returnTo, fallback), "error");

  if (clean(form.get("website"), 200)) {
    return NextResponse.redirect(successUrl, 303);
  }

  const issueType = clean(form.get("issueType"), 80) || "general";
  const message = clean(form.get("message"), 4000);
  const prUrl = clean(form.get("prUrl"), 500);
  const repository = clean(form.get("repository"), 240);

  if (!message || message.length < 10) {
    return NextResponse.redirect(errorUrl, 303);
  }

  const session = await currentSession();
  let installationId: number | undefined;
  let accountLogin = clean(form.get("accountLogin"), 120);
  let userLine = "Visitor: public contact form";
  let contactEmail = clean(form.get("email"), 240);
  let contactName = clean(form.get("name"), 160);
  const company = clean(form.get("company"), 160);

  if (source === "internal") {
    if (!session) {
      const loginUrl = new URL("/api/auth/github/start", request.url);
      loginUrl.searchParams.set("returnTo", "/dashboard");
      return NextResponse.redirect(loginUrl, 303);
    }

    const requestedInstallationId = Number(
      clean(form.get("installationId"), 40),
    );
    if (
      Number.isSafeInteger(requestedInstallationId) &&
      requestedInstallationId > 0
    ) {
      const github = await userInstallations(session.accessToken);
      const hasAccess = github.installations.some(
        (installation) => installation.id === requestedInstallationId,
      );
      if (!hasAccess) return NextResponse.redirect(errorUrl, 303);
      installationId = requestedInstallationId;
      const installation = await getInstallation(installationId);
      accountLogin = installation?.accountLogin ?? accountLogin;
    }

    const profile = await getUserProfile(session.userId);
    contactName = session.login;
    contactEmail = session.email || profile?.email || "";
    userLine = [
      `GitHub user: ${session.login}`,
      `User ID: ${session.userId}`,
      contactEmail ? `Email: ${contactEmail}` : "Email: not supplied by GitHub",
    ].join("\n");
  } else if (
    !contactEmail ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)
  ) {
    return NextResponse.redirect(errorUrl, 303);
  }

  const subjectPrefix =
    source === "internal" ? "User support" : "Public contact";
  const subject = `[API Contract Guard] ${subjectPrefix}: ${issueType}`;
  const body = [
    subject,
    "",
    userLine,
    contactName ? `Name: ${contactName}` : "",
    company ? `Company: ${company}` : "",
    accountLogin ? `GitHub account/org: ${accountLogin}` : "",
    installationId ? `Installation ID: ${installationId}` : "",
    repository ? `Repository: ${repository}` : "",
    prUrl ? `Pull request/check URL: ${prUrl}` : "",
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendEmail({
      to: supportEmail,
      subject,
      text: body,
    });
    await recordOperationalEvent({
      severity: "info",
      source: "support",
      message:
        source === "internal"
          ? "Signed-in support request received"
          : "Public contact form submitted",
      detail: [
        issueType,
        contactEmail || contactName || "unknown contact",
        accountLogin,
      ]
        .filter(Boolean)
        .join(" - "),
      installationId,
    });
    return NextResponse.redirect(successUrl, 303);
  } catch (error) {
    console.error("Could not send support contact email", { error });
    await recordOperationalEvent({
      severity: "error",
      source: "support",
      message: "Support contact email failed",
      detail: issueType,
      installationId,
    }).catch(() => {});
    return NextResponse.redirect(errorUrl, 303);
  }
}
