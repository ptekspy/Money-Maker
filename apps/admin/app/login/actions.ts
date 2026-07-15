"use server";

import { redirect } from "next/navigation";
import { setAdminCookie } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/login?error=1");
  }

  await setAdminCookie(password);
  redirect("/");
}
