import { apiRequest } from "@/lib/api/client";

/** Registers this browser's FCM token for the signed-in user. */
export function savePushToken(input: { token: string; userAgent?: string }) {
  return apiRequest("POST", "/push/tokens", input);
}

/** Unregisters a token. The API only removes tokens owned by the signed-in user. */
export function removePushToken(input: { token: string }) {
  return apiRequest("DELETE", "/push/tokens", input);
}

export function sendTestNotification() {
  return apiRequest<{ sent: number }>("POST", "/push/test");
}
