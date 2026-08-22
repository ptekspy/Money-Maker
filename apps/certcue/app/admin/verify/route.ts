import { type NextRequest, NextResponse } from "next/server";
import { establishAdminSession, hashAdminToken } from "@/lib/admin-auth";
import { consumeAdminLoginToken } from "@/lib/data";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
    );
  }

  const email = await consumeAdminLoginToken(hashAdminToken(token));
  if (!email) {
    return NextResponse.redirect(
      new URL("/admin/login?error=expired", request.url),
    );
  }

  await establishAdminSession(email);
  return NextResponse.redirect(new URL("/admin", request.url));
}
