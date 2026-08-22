import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  deleteAdminSession,
  getAdminSession,
} from "@/lib/data";

const cookieName = "letdue_admin_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

export function adminEmail() {
  return (process.env.LETDUE_ADMIN_EMAIL ?? "hello@letdue.com")
    .trim()
    .toLowerCase();
}

export function newAdminToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAdminToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function establishAdminSession(email: string) {
  const token = newAdminToken();
  await createAdminSession({
    email,
    tokenHash: hashAdminToken(token),
    expiresAtEpoch: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  });
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionLifetimeSeconds,
    path: "/admin",
  });
}

export async function currentAdmin() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) return null;
  const session = await getAdminSession(hashAdminToken(token));
  if (!session || session.email !== adminEmail()) return null;
  return session;
}

export async function requireAdmin() {
  const session = await currentAdmin();
  if (!session) redirect("/admin/login");
  return session;
}

export async function clearAdminSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await deleteAdminSession(hashAdminToken(token));
  jar.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/admin",
  });
}
