import { type NextRequest, NextResponse } from "next/server";
import {
  ATTRIBUTION_COOKIE,
  RETURN_TO_COOKIE,
  SESSION_COOKIE,
  STATE_COOKIE,
  sealSession,
  secureCookie,
  VERIFIER_COOKIE,
} from "@/lib/auth";
import { recordFunnelEvent, saveUserProfile } from "@/lib/data";
import { sendEmailOnce } from "@/lib/email";
import { requiredEnv } from "@/lib/env";
import { githubFetch } from "@/lib/github";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const verifier = request.cookies.get(VERIFIER_COOKIE)?.value;
  if (!code || !state || state !== expectedState || !verifier) {
    console.warn("GitHub OAuth callback rejected", {
      hasCode: Boolean(code),
      hasState: Boolean(state),
      hasExpectedState: Boolean(expectedState),
      stateMatches: Boolean(state && expectedState && state === expectedState),
      hasVerifier: Boolean(verifier),
    });
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }

  const callback = new URL("/api/auth/github/callback", request.nextUrl.origin);
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: requiredEnv("CONTRACTGUARD_GITHUB_CLIENT_ID"),
        client_secret: requiredEnv("CONTRACTGUARD_GITHUB_CLIENT_SECRET"),
        code,
        redirect_uri: callback.toString(),
        code_verifier: verifier,
      }),
    },
  );
  const token = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!token.access_token) {
    console.warn("GitHub OAuth token exchange rejected", {
      status: tokenResponse.status,
      error: token.error ?? "unknown",
    });
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }
  const user = await githubFetch<{
    id: number;
    login: string;
    avatar_url: string;
  }>("/user", token.access_token);
  const emails = await githubFetch<
    Array<{ email: string; primary: boolean; verified: boolean }>
  >("/user/emails", token.access_token).catch(() => []);
  const email =
    emails.find((item) => item.primary && item.verified)?.email ??
    emails.find((item) => item.verified)?.email;
  let attribution: { source?: string; campaign?: string } = {};
  const encodedAttribution = request.cookies.get(ATTRIBUTION_COOKIE)?.value;
  if (encodedAttribution) {
    try {
      attribution = JSON.parse(
        Buffer.from(encodedAttribution, "base64url").toString("utf8"),
      ) as { source?: string; campaign?: string };
    } catch {
      attribution = {};
    }
  }
  await Promise.all([
    saveUserProfile({
      userId: user.id,
      login: user.login,
      email,
      source: attribution.source,
      campaign: attribution.campaign,
    }),
    recordFunnelEvent({
      type: "github_sign_in",
      source: attribution.source ?? "direct",
      campaign: attribution.campaign,
      userId: user.id,
      login: user.login,
    }),
  ]);
  if (email) {
    await sendEmailOnce({
      ownerKey: `USER#${user.id}`,
      kind: "signed_in_welcome",
      to: email,
      subject: "Finish connecting API Contract Guard",
      text: `Hi ${user.login},\n\nYou are signed in to API Contract Guard. The next step is to install the GitHub App on the repositories you want protected.\n\nContinue setup: https://app.apicontractguard.com/dashboard\n\nNo card is required for the 14-day trial.\n\nAPI Contract Guard`,
    }).catch((error) => {
      console.error("Could not send Contract Guard welcome email", { error });
    });
  }
  const session = await sealSession({
    userId: user.id,
    login: user.login,
    avatarUrl: user.avatar_url,
    accessToken: token.access_token,
    email,
  });
  const returnTo = request.cookies.get(RETURN_TO_COOKIE)?.value;
  const response = NextResponse.redirect(
    new URL(
      returnTo?.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : "/dashboard",
      request.url,
    ),
  );
  response.cookies.set(SESSION_COOKIE, session, {
    ...secureCookie,
    maxAge: 60 * 60 * 8,
  });
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  response.cookies.delete(ATTRIBUTION_COOKIE);
  response.cookies.delete(RETURN_TO_COOKIE);
  return response;
}
