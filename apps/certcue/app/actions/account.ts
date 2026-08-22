"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  claimUserLoginAttempt,
  clearUserLoginAttempts,
  getUserByEmail,
} from "@/lib/data";
import {
  clearUserSession,
  establishUserSession,
  verifyPassword,
} from "@/lib/user-auth";

export async function loginCustomer(formData: FormData) {
  const parsed = z
    .object({
      email: z.email().trim().toLowerCase(),
      password: z.string().min(1).max(128),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=invalid");

  if (!(await claimUserLoginAttempt(parsed.data.email)))
    redirect("/login?error=invalid");
  const user = await getUserByEmail(parsed.data.email);
  const passwordValid = await verifyPassword(
    parsed.data.password,
    user?.passwordHash ?? "00".repeat(64),
    user?.passwordSalt ?? "00".repeat(16),
  );
  if (!user?.passwordHash || !user.passwordSalt || !passwordValid) {
    redirect("/login?error=invalid");
  }

  await clearUserLoginAttempts(user.email);
  await establishUserSession(user.id);
  redirect("/account");
}

export async function logoutCustomer() {
  await clearUserSession();
  redirect("/login");
}
