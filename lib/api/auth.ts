import { apiRequest } from "@/lib/api/client";
import type { OtpPurpose } from "@/lib/api/types";

export function requestOtp(input: { email: string; purpose: OtpPurpose }) {
  return apiRequest("POST", "/auth/otp/request", input);
}

/**
 * On success the API sets the HttpOnly cookies: a short-lived access token and a refresh token
 * (see lib/api/client.ts and app/api/v1/auth/web-refresh for how they are renewed).
 */
export function verifyOtp(input: { email: string; purpose: OtpPurpose; code: string }) {
  return apiRequest("POST", "/auth/otp/verify", { ...input, useRefreshToken: true });
}

export function signOut() {
  return apiRequest("POST", "/auth/signout");
}

/** Permanently deletes the signed-in account and all of its data. Also clears the session cookie. */
export function deleteAccount() {
  return apiRequest("DELETE", "/auth/me");
}
