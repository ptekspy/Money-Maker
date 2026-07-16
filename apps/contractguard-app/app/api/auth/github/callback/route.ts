import { type NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  STATE_COOKIE,
  sealSession,
  secureCookie,
  VERIFIER_COOKIE,
} from "@/lib/auth";
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
  const session = await sealSession({
    userId: user.id,
    login: user.login,
    avatarUrl: user.avatar_url,
    accessToken: token.access_token,
  });
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(SESSION_COOKIE, session, {
    ...secureCookie,
    maxAge: 60 * 60 * 8,
  });
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  return response;
}
