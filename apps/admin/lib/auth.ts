import { cookies } from "next/headers";

const cookieName = "qwb_admin";

export async function isAuthed() {
  const jar = await cookies();
  return jar.get(cookieName)?.value === process.env.ADMIN_PASSWORD;
}

export async function setAdminCookie(password: string) {
  const jar = await cookies();
  jar.set(cookieName, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(cookieName);
}
