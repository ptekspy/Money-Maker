import { createHash, randomBytes } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { env, requiredEnv } from "@/lib/env";

export const SESSION_COOKIE = "contractguard_session";
export const STATE_COOKIE = "contractguard_oauth_state";
export const VERIFIER_COOKIE = "contractguard_pkce_verifier";
export const ATTRIBUTION_COOKIE = "contractguard_attribution";
export const RETURN_TO_COOKIE = "contractguard_return_to";

export type Session = {
  userId: number;
  login: string;
  avatarUrl: string;
  accessToken: string;
  email?: string;
};

function sessionKey() {
  return createHash("sha256")
    .update(requiredEnv("CONTRACTGUARD_SESSION_SECRET"))
    .digest();
}

export async function sealSession(session: Session): Promise<string> {
  return new EncryptJWT(session)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .encrypt(sessionKey());
}

export async function openSession(value?: string): Promise<Session | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtDecrypt(value, sessionKey());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function currentSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return openSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export function isAdminLogin(login: string) {
  const configured = env("CONTRACTGUARD_ADMIN_LOGINS") || "ptekspy";
  return configured
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(login.toLowerCase());
}

export function oauthValues() {
  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { state, verifier, challenge };
}

export const secureCookie = {
  httpOnly: true,
  // The app is always served over HTTPS in AWS. Requiring Secure ensures the
  // short-lived OAuth state and verifier survive the GitHub redirect safely.
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};
