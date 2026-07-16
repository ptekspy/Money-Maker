import { type NextRequest, NextResponse } from "next/server";
import {
  oauthValues,
  STATE_COOKIE,
  secureCookie,
  VERIFIER_COOKIE,
} from "@/lib/auth";
import { requiredEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { state, verifier, challenge } = oauthValues();
  const callback = new URL("/api/auth/github/callback", request.nextUrl.origin);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set(
    "client_id",
    requiredEnv("CONTRACTGUARD_GITHUB_CLIENT_ID"),
  );
  authorize.searchParams.set("redirect_uri", callback.toString());
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, { ...secureCookie, maxAge: 600 });
  response.cookies.set(VERIFIER_COOKIE, verifier, {
    ...secureCookie,
    maxAge: 600,
  });
  return response;
}
