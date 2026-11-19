"use client";

import * as React from "react";
import { Download, Loader2, Mail } from "lucide-react";

import { REPORT_PERIOD_LABEL, downloadReport, sendReport, type ReportPeriod } from "@/lib/api/reports";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Only the last 7 days for now. A period picker (and a custom date range) can replace this
// constant without changing the buttons or the API calls.
const PERIOD: ReportPeriod = "last7";

/** Email the report to yourself, or download it as a PDF. */
export function ReportActions() {
  const { toast } = useToast();
  const [sending, startSend] = React.useTransition();
  const [downloading, startDownload] = React.useTransition();
  const busy = sending || downloading;
  const label = REPORT_PERIOD_LABEL[PERIOD].toLowerCase();

  function email() {
    startSend(async () => {
      const result = await sendReport(PERIOD);
      if (result.ok) {
        toast({
          title: "Report sent",
          description: `Your ${label} report (PDF attached) is on its way to ${result.email}.`,
          variant: "success",
        });
      } else {
        toast({ title: "Couldn't send the report", description: result.error, variant: "error" });
      }
    });
  }

  function download() {
    startDownload(async () => {
      const result = await downloadReport(PERIOD);
      if (result.ok) {
        toast({ title: "Report downloaded", description: `Saved your ${label} report as a PDF.`, variant: "success" });
      } else {
        toast({ title: "Couldn't download the report", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <Button variant="outline" size="sm" onClick={download} disabled={busy}>
        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Download PDF
      </Button>
      <Button size="sm" onClick={email} disabled={busy}>
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Email report
      </Button>
    </div>
  );
}
