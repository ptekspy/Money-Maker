import { type NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (isPublic) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;
  const cookie = request.cookies.get("qwb_admin")?.value;

  if (!password || cookie !== password) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};
