// Server-side (Server Component) access to the FastAPI backend.
//
// Calls the API directly (API_URL) and forwards the visitor's session cookie. Browser-side
// calls use lib/api/client.ts instead. Importing next/headers here keeps this out of client code.
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import type {
  AuthUser,
  DashboardData,
  LinkedUser,
  MedicationsPageData,
  PatientOverview,
  StatisticsData,
  TodayData,
  WellnessData,
} from "@/lib/api/types";

/** Backend base URL. In production it must be set explicitly (no silent localhost fallback). */
export function apiBase(): string {
  const url = process.env.API_URL;
  if (!url && process.env.NODE_ENV === "production") {
    throw new Error("API_URL is not set. Set it to the backend's URL (see .env.production).");
  }
  return (url ?? "http://localhost:8000").replace(/\/+$/, "");
}

export const SESSION_COOKIE = "session";
export const REFRESH_COOKIE = "refresh_token";
/** Set for a few seconds after a refresh, so a still-failing request signs out instead of looping. */
export const REFRESHED_COOKIE = "refreshed";
export const WEB_REFRESH_PATH = "/api/v1/auth/web-refresh";
const TIMEOUT_MS = 15_000;

async function fetchApi(path: string): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const base = apiBase();
  try {
    return await fetch(`${base}/api/v1${path}`, {
      headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new Error(`Could not reach the API at ${base}. Is the backend running?`);
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string") return body.error;
  } catch {}
  return `API request failed (${response.status}).`;
}

/** The signed-in user, or null when there is no valid session. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const response = await fetchApi("/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(await errorMessage(response));
  return (await response.json()) as AuthUser;
});

/**
 * The API said 401. The short-lived access token may just have expired, so hand over to the
 * refresh route (server components can't set cookies themselves); it renews the session and
 * returns here. Without a session cookie, or right after a refresh that didn't help, sign in.
 */
async function refreshSessionOrSignIn(): Promise<never> {
  const jar = await cookies();
  if (!jar.has(SESSION_COOKIE) || jar.has(REFRESHED_COOKIE)) redirect("/signin");
  const path = (await headers()).get("x-pathname") ?? "/dashboard";
  redirect(`${WEB_REFRESH_PATH}?next=${encodeURIComponent(path)}`);
}

/** For pages: returns the signed-in user or renews the session / redirects to /signin. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) return refreshSessionOrSignIn();
  return user;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetchApi(path);
  if (response.status === 401) return refreshSessionOrSignIn();
  if (!response.ok) throw new Error(await errorMessage(response));
  return (await response.json()) as T;
}

export const getDashboardData = () => getJson<DashboardData>("/dashboard");
export const getTodayData = () => getJson<TodayData>("/today");
export const getMedicationsPageData = () => getJson<MedicationsPageData>("/medications");
export const getStatisticsData = () => getJson<StatisticsData>("/statistics");
export const getWellnessData = () => getJson<WellnessData>("/wellness");

export const getPatients = () => getJson<LinkedUser[]>("/family/patients");
export const getCaregivers = () => getJson<LinkedUser[]>("/family/caregivers");

/** A followed account's read-only overview. 404s (not linked / unknown id) show the not-found page. */
export async function getPatientOverview(patientId: string): Promise<PatientOverview> {
  if (!/^[0-9a-fA-F]{24}$/.test(patientId)) notFound();
  const response = await fetchApi(`/family/patients/${patientId}/overview`);
  if (response.status === 401) return refreshSessionOrSignIn();
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(await errorMessage(response));
  return (await response.json()) as PatientOverview;
}
