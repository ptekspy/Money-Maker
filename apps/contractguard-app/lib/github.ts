import { createHmac, timingSafeEqual } from "node:crypto";
import { importPKCS8, SignJWT } from "jose";
import { requiredEnv } from "@/lib/env";

const API_VERSION = "2026-03-10";

export async function githubFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": API_VERSION,
      "User-Agent": "API-Contract-Guard",
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(
      `GitHub ${response.status}: ${(await response.text()).slice(0, 500)}`,
    );
  }
  return (await response.json()) as T;
}

export async function appJwt(): Promise<string> {
  const appId = requiredEnv("CONTRACTGUARD_GITHUB_APP_ID");
  const pem = requiredEnv("CONTRACTGUARD_GITHUB_PRIVATE_KEY").replaceAll(
    "\\n",
    "\n",
  );
  const key = await importPKCS8(pem, "RS256");
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 9 * 60)
    .setIssuer(appId)
    .sign(key);
}

export async function installationToken(installationId: number) {
  const result = await githubFetch<{ token: string }>(
    `/app/installations/${installationId}/access_tokens`,
    await appJwt(),
    { method: "POST" },
  );
  return result.token;
}

export function verifyWebhookSignature(body: string, signature: string | null) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac(
    "sha256",
    requiredEnv("CONTRACTGUARD_GITHUB_WEBHOOK_SECRET"),
  )
    .update(body)
    .digest("hex")}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function userInstallations(accessToken: string) {
  return githubFetch<{
    installations: Array<{
      id: number;
      account: { id: number; login: string; avatar_url: string; type: string };
      repository_selection: string;
    }>;
  }>("/user/installations?per_page=100", accessToken);
}

export async function installationRepositories(installationId: number) {
  const token = await installationToken(installationId);
  return githubFetch<{
    repositories: Array<{
      id: number;
      full_name: string;
      private: boolean;
    }>;
  }>("/installation/repositories?per_page=100", token);
}
