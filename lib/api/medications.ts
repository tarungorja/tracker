import { apiRequest } from "@/lib/api/client";
import type { MedicationView } from "@/lib/api/types";

export interface MedicationInput {
  /** Present when editing an existing medication. */
  id?: string;
  name: string;
  description?: string;
  instructions?: string;
  scheduleTimes: string[];
  daysOfWeek: number[];
}

const path = (id: string) => `/medications/${encodeURIComponent(id)}`;

export function setMedicationEnabled(input: { id: string; enabled: boolean }) {
  return apiRequest<MedicationView>("PATCH", `${path(input.id)}/enabled`, {
    enabled: input.enabled,
  });
}

export function upsertMedication({ id, ...body }: MedicationInput) {
  return id
    ? apiRequest<MedicationView>("PUT", path(id), body)
    : apiRequest<MedicationView>("POST", "/medications", body);
}

export function deleteMedication(input: { id: string }) {
  return apiRequest("DELETE", path(input.id));
}
