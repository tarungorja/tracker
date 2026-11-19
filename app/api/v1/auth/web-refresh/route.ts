// Renews an expired session for server-rendered pages.
//
// Server components can't set cookies, so when the API rejects the short-lived access token they
// redirect here (see refreshSessionOrSignIn in lib/api/server.ts). This route trades the refresh
// cookie for a new access + refresh pair, forwards the API's Set-Cookie headers to the browser,
// and sends the visitor back to the page they were on. The refresh cookie is scoped to
// /api/v1/auth, which is why this lives under that path.
//
// Being a real route file, it takes precedence over the /api/v1/* rewrite to the API.
import { NextResponse, type NextRequest } from "next/server";

import {
  REFRESHED_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  WEB_REFRESH_PATH,
  apiBase,
} from "@/lib/api/server";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 15_000;

/** Only same-site paths: never redirect to another origin (open-redirect guard). */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/dashboard";
  }
  return value.startsWith(WEB_REFRESH_PATH) ? "/dashboard" : value;
}

function signedOut(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/signin", request.url));
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { path: "/api/v1/auth", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return signedOut(request);

  let apiResponse: Response;
  try {
    apiResponse = await fetch(`${apiBase()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { cookie: `${REFRESH_COOKIE}=${refreshToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    // The API couldn't be reached: keep the cookies so a retry can work, and let the page show
    // its own error instead of signing the user out over a network blip.
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (apiResponse.status === 401) return signedOut(request); // revoked, replaced or expired
  if (!apiResponse.ok) return NextResponse.redirect(new URL(next, request.url));

  const response = NextResponse.redirect(new URL(next, request.url));
  for (const cookie of apiResponse.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  // If the page is still refused, it signs in instead of coming back here.
  response.cookies.set(REFRESHED_COOKIE, "1", {
    path: "/",
    maxAge: 10,
    httpOnly: true,
    sameSite: "lax",
  });
  return response;
}
