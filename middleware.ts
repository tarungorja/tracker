import { NextResponse, type NextRequest } from "next/server";

// Edge middleware can't query MongoDB, so this only checks that a session cookie
// exists. The cookie is validated against the database in `requireUser()`, and the
// auth pages redirect already-signed-in users themselves (so a stale cookie can't
// cause a redirect loop).
const SESSION_COOKIE = "session";
const AUTH_PAGES = ["/signin", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!isAuthPage && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|icon.svg|firebase-messaging-sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
