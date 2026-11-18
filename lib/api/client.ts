// Browser-side HTTP client for the FastAPI backend.
//
// Requests go to same-origin `/api/v1/...`, which next.config.ts proxies to the API. That keeps
// the HttpOnly session cookie first-party and avoids CORS. Every call resolves (never throws)
// to `{ ok: true, ...data }` or `{ ok: false, error }`, the shape the components already use.

const BASE_PATH = "/api/v1";

export type ApiResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T extends object = object>(
  method: Method,
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${BASE_PATH}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Empty or non-JSON body.
  }

  if (!response.ok) {
    // The session expired or was revoked: send the user back to sign in.
    if (response.status === 401 && !path.startsWith("/auth/") && typeof window !== "undefined") {
      window.location.assign("/signin");
    }
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `Request failed (${response.status}).`;
    return { ok: false, error: message };
  }

  return { ok: true, ...(data && typeof data === "object" ? data : {}) } as ApiResult<T>;
}

/** Appends `?date=` when a date is given. */
export function withDate(path: string, date?: string): string {
  return date ? `${path}?date=${encodeURIComponent(date)}` : path;
}
