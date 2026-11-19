import { LifeBuoy, Mail, Phone } from "lucide-react";

import { CONTACT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const linkClass =
  "inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline";

export function HelpCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-primary" /> Help &amp; support
        </CardTitle>
        <CardDescription>
          Questions, a problem with the app, or a request about your data? Get in touch.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Medication Tracker support")}`}
          className={linkClass}
        >
          <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
        </a>
        <a href={`tel:${SUPPORT_PHONE}`} className={linkClass}>
          <Phone className="h-4 w-4" /> {SUPPORT_PHONE_DISPLAY}
        </a>
      </CardContent>
    </Card>
  );
}
