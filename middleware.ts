import { NextResponse, type NextRequest } from "next/server";

// Edge middleware can't call the API cheaply, so this only checks that a session cookie
// exists. The API validates it (via `requireUser()` in lib/api/server.ts), and the auth
// pages redirect already-signed-in users themselves (so a stale cookie can't cause a
// redirect loop).
const SESSION_COOKIE = "session";
const AUTH_PAGES = ["/signin", "/signup"];
// Readable without an account (linked from the sign-in and sign-up forms).
const PUBLIC_PAGES = ["/privacy"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  const isPublicPage = isAuthPage || PUBLIC_PAGES.includes(pathname);

  if (!isPublicPage && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|icon.svg|firebase-messaging-sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
