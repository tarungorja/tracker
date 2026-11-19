import { apiRequest, type ApiResult } from "@/lib/api/client";

/** Reporting windows the API supports. Add "custom" (with a date range) here later. */
export type ReportPeriod = "last7";

export const REPORT_PERIOD_LABEL: Record<ReportPeriod, string> = {
  last7: "Last 7 days",
};

/** Emails the report (with the PDF attached) to the signed-in user. */
export function sendReport(period: ReportPeriod) {
  return apiRequest<{ email: string; startDate: string; endDate: string }>(
    "POST",
    "/reports/send",
    { period },
  );
}

/** Downloads the report as a PDF through the browser's normal "save file" flow. */
export async function downloadReport(period: ReportPeriod): Promise<ApiResult> {
  let response: Response;
  try {
    response = await fetch(`/api/v1/reports/download?period=${encodeURIComponent(period)}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }

  if (!response.ok) {
    if (response.status === 401) window.location.assign("/signin");
    let message = `Request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: unknown };
      if (typeof body.error === "string") message = body.error;
    } catch {}
    return { ok: false, error: message };
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? "medication-report.pdf";

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true };
}
