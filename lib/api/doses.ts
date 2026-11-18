import { apiRequest } from "@/lib/api/client";

export function setDoseCompletion(input: {
  medicationName: string;
  scheduledTime: string;
  completed: boolean;
  /** YYYY-MM-DD (IST). Defaults to today on the server. */
  date?: string;
}) {
  return apiRequest("PUT", "/doses/completion", input);
}
