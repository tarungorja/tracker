import { apiRequest } from "@/lib/api/client";
import type { InviteView, LinkedUser } from "@/lib/api/types";

/** Father: creates a one-time code (replacing any earlier one) to share with a family member. */
export function createInvite() {
  return apiRequest<InviteView>("POST", "/family/invite");
}

/** Son: connects to the account that issued the code. */
export function connectWithCode(code: string) {
  return apiRequest<LinkedUser>("POST", "/family/connect", { code });
}

/** Son: stops following an account. */
export function stopFollowing(patientId: string) {
  return apiRequest("DELETE", `/family/patients/${encodeURIComponent(patientId)}`);
}

/** Father: removes someone's access to his account. */
export function revokeCaregiver(caregiverId: string) {
  return apiRequest("DELETE", `/family/caregivers/${encodeURIComponent(caregiverId)}`);
}

/** Son: pushes a "you missed a dose" notification. The API refuses it when nothing was missed. */
export function remindPatient(patientId: string) {
  return apiRequest<{ sent: number; missedCount: number }>(
    "POST",
    `/family/patients/${encodeURIComponent(patientId)}/remind`,
  );
}
