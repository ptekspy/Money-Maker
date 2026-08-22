import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createUserSession,
  deleteUserSession,
  getUser,
  getUserSession,
} from "@/lib/data";

const scrypt = promisify(scryptCallback);
const cookieName = "letdue_user_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 30;

export function newUserToken() {
  return randomBytes(32).toString("base64url");
}

export function hashUserToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return { passwordHash: derived.toString("hex"), passwordSalt: salt };
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
  passwordSalt: string,
) {
  const expected = Buffer.from(passwordHash, "hex");
  const actual = (await scrypt(
    password,
    passwordSalt,
    expected.length,
  )) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function establishUserSession(userId: string) {
  const token = newUserToken();
  await createUserSession({
    userId,
    tokenHash: hashUserToken(token),
    expiresAtEpoch: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  });
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionLifetimeSeconds,
    path: "/",
  });
}

export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) return null;
  const session = await getUserSession(hashUserToken(token));
  if (!session) return null;
  return getUser(session.userId);
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function clearUserSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await deleteUserSession(hashUserToken(token));
  jar.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
