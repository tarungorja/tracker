import { NextResponse, type NextRequest } from "next/server";

// Edge middleware can't call the API cheaply, so this only checks that a session cookie
// exists. The API validates it (via `requireUser()` in lib/api/server.ts), and the auth
// pages redirect already-signed-in users themselves (so a stale cookie can't cause a
// redirect loop).
const SESSION_COOKIE = "session";
const AUTH_PAGES = ["/signin", "/signup"];
// Readable without an account: linked from the sign-in and sign-up forms, and the URLs given to
// Google Play (privacy policy, how to delete an account).
const PUBLIC_PAGES = ["/privacy", "/delete-account"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // "/" is not a page: it only decides where to go. A session goes to the dashboard, no session
  // goes to sign-in.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(hasSession ? "/dashboard" : "/signin", request.url));
  }

  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isPublicPage = isAuthPage || PUBLIC_PAGES.includes(pathname);

  if (!isPublicPage && !hasSession) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  // Server code reads this to come back to the same page after refreshing an expired session.
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|icon.svg|firebase-messaging-sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
