"use client";

import * as React from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";

import {
  getStoredPushToken,
  isPushSupported,
  requestPushToken,
  revokePushToken,
} from "@/lib/firebase/client";
import { removePushToken, savePushToken, sendTestNotification } from "@/actions/push";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type State = "loading" | "unsupported" | "denied" | "off" | "on";

export function NotificationToggle() {
  const { toast } = useToast();
  const [state, setState] = React.useState<State>("loading");
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await isPushSupported())) return !cancelled && setState("unsupported");
      if (Notification.permission === "denied") return !cancelled && setState("denied");
      const enabled = Notification.permission === "granted" && Boolean(getStoredPushToken());
      if (!cancelled) setState(enabled ? "on" : "off");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function enable() {
    startTransition(async () => {
      try {
        const token = await requestPushToken();
        const result = await savePushToken({ token, userAgent: navigator.userAgent });
        if (!result.ok) throw new Error(result.error);
        setState("on");
        toast({
          title: "Reminders on",
          description: "You'll get a notification when it's time for a dose.",
          variant: "success",
        });
      } catch (error) {
        setState(Notification.permission === "denied" ? "denied" : "off");
        toast({
          title: "Couldn't enable reminders",
          description: error instanceof Error ? error.message : undefined,
          variant: "error",
        });
      }
    });
  }

  function disable() {
    startTransition(async () => {
      const token = await revokePushToken();
      if (token) await removePushToken({ token });
      setState("off");
      toast({ title: "Reminders off", variant: "info" });
    });
  }

  function sendTest() {
    startTransition(async () => {
      const result = await sendTestNotification();
      if (!result.ok) {
        toast({ title: "Test failed", description: result.error, variant: "error" });
      }
    });
  }

  if (state === "loading" || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Notifications blocked"
        title="Notifications are blocked. Allow them in your browser's site settings."
        onClick={() =>
          toast({
            title: "Notifications are blocked",
            description: "Allow notifications for this site in your browser settings, then reload.",
            variant: "info",
          })
        }
      >
        <BellOff className="h-5 w-5" />
      </Button>
    );
  }

  if (state === "off") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Turn on dose reminders"
        title="Turn on dose reminders"
        disabled={pending}
        onClick={enable}
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5" />}
      </Button>
    );
  }

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-primary"
        aria-label="Send a test notification"
        title="Reminders on: click to send a test notification"
        disabled={pending}
        onClick={sendTest}
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <BellRing className="h-5 w-5" />}
      </Button>
      <button
        type="button"
        onClick={disable}
        disabled={pending}
        className="hidden text-xs text-muted-foreground hover:text-foreground md:inline"
      >
        Turn off
      </button>
    </div>
  );
}
