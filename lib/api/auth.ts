import { apiRequest } from "@/lib/api/client";
import type { OtpPurpose } from "@/lib/api/types";

export function requestOtp(input: { email: string; purpose: OtpPurpose }) {
  return apiRequest("POST", "/auth/otp/request", input);
}

/** On success the API sets the HttpOnly session cookie. */
export function verifyOtp(input: { email: string; purpose: OtpPurpose; code: string }) {
  return apiRequest("POST", "/auth/otp/verify", input);
}

export function signOut() {
  return apiRequest("POST", "/auth/signout");
}

/** Permanently deletes the signed-in account and all of its data. Also clears the session cookie. */
export function deleteAccount() {
  return apiRequest("DELETE", "/auth/me");
}
