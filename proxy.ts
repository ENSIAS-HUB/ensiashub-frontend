import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/feed",
  "/groups",
  "/drive",
  "/eats",
  "/smart-campus",
  "/map",
  "/admin",
  "/settings",
  "/profile",
  "/users",
];

// Auth routes (redirect to /feed if already logged in)
const AUTH_PATHS = ["/login", "/callback", "/complete-profile"];

// Always public — no auth check at all
const ALWAYS_PUBLIC = ["/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing page and public marketing pages — always accessible
  if (ALWAYS_PUBLIC.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Auth pages — always accessible (login, callback, complete-profile)
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (isAuthPath) return NextResponse.next();

  // Protected routes — require a valid token cookie
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
