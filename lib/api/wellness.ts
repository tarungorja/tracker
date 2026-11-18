import { apiRequest, withDate } from "@/lib/api/client";

interface CountBody {
  count: number;
}

export function incrementCount(date?: string) {
  return apiRequest<CountBody>("POST", withDate("/wellness/count/increment", date));
}

export function decrementCount(date?: string) {
  return apiRequest<CountBody>("POST", withDate("/wellness/count/decrement", date));
}

export function resetCount(date?: string) {
  return apiRequest<CountBody>("POST", withDate("/wellness/count/reset", date));
}

export function setDayNotes(input: { notes: string; date?: string }) {
  return apiRequest("PUT", "/wellness/notes", input);
}
