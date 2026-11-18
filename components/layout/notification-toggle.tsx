"use client";

import * as React from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";

import {
  hasAskedForPush,
  isPushOptedOut,
  isPushSupported,
  markAskedForPush,
  requestPushToken,
  revokePushToken,
  setPushOptOut,
} from "@/lib/firebase/client";
import { removePushToken, savePushToken, sendTestNotification } from "@/lib/api/push";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type State = "loading" | "unsupported" | "denied" | "off" | "on";

// Shared by every run of the effect below (React Strict Mode runs it twice in development), so
// the browser is only ever asked once and both runs see the answer.
let loginPrompt: Promise<boolean> | null = null;

/**
 * Shows the browser's own "Allow / Block" popup and, if allowed, registers this device for
 * reminders. Resolves true when notifications were allowed and the device was registered.
 */
function askForPermission(): Promise<boolean> {
  loginPrompt ??= (async () => {
    markAskedForPush(); // once per tab session, not on every page load
    try {
      const token = await requestPushToken(true);
      const result = await savePushToken({ token, userAgent: navigator.userAgent });
      if (!result.ok) throw new Error(result.error);
      setPushOptOut(false);
      try {
        sessionStorage.setItem("push-synced", "1");
      } catch {}
      return true;
    } catch {
      return false; // blocked, or the popup was dismissed
    }
  })();
  return loginPrompt;
}

/** Read fresh each time: the user may have answered the popup since the last check. */
function currentPermission(): NotificationPermission {
  return Notification.permission;
}

export function NotificationToggle() {
  const { toast } = useToast();
  // The effect below runs once on mount; keep the latest toast without re-running it.
  const toastRef = React.useRef(toast);
  toastRef.current = toast;
  const [state, setState] = React.useState<State>("loading");
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await isPushSupported())) return !cancelled && setState("unsupported");
      if (Notification.permission === "denied") return !cancelled && setState("denied");

      // The user hasn't decided yet (they just opened the app after signing in): show the
      // browser's permission popup right away. If they dismiss it, the bell stays available.
      if (Notification.permission === "default" && !isPushOptedOut()) {
        if (!hasAskedForPush()) {
          loginPrompt = null; // a fresh login: ask (sign-out clears the memory)
        } else if (!loginPrompt) {
          // Already asked in this tab session (e.g. a page reload): don't nag again.
          return !cancelled && setState("off");
        }
        const allowed = await askForPermission();
        if (cancelled) return;
        if (allowed) {
          setState("on");
          toastRef.current({
            title: "Reminders on",
            description: "You'll get a notification when it's time for a dose.",
            variant: "success",
          });
        } else {
          setState(currentPermission() === "denied" ? "denied" : "off");
        }
        return;
      }

      // Notifications were already allowed on this browser: register this device for the
      // signed-in user automatically (once per tab session), so every device that is logged
      // in as this user receives reminders without clicking the bell again.
      if (Notification.permission === "granted" && !isPushOptedOut()) {
        try {
          if (!sessionStorage.getItem("push-synced")) {
            const token = await requestPushToken(false);
            const result = await savePushToken({ token, userAgent: navigator.userAgent });
            if (!result.ok) throw new Error(result.error);
            sessionStorage.setItem("push-synced", "1");
          }
          if (!cancelled) setState("on");
          return;
        } catch {
          // Fall through to the manual bell if silent registration fails.
        }
      }
      if (!cancelled) setState("off");
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
        setPushOptOut(false);
        try {
          sessionStorage.setItem("push-synced", "1");
        } catch {}
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
      setPushOptOut(true); // remembered so this browser isn't re-enabled automatically
      const token = await revokePushToken();
      if (token) await removePushToken({ token });
      try {
        sessionStorage.removeItem("push-synced");
      } catch {}
      setState("off");
      toast({ title: "Reminders off", variant: "info" });
    });
  }

  function sendTest() {
    startTransition(async () => {
      const result = await sendTestNotification();
      if (result.ok) {
        const n = result.sent;
        toast({
          title: "Test sent",
          description: `Sent to ${n} device${n === 1 ? "" : "s"} logged in as you.`,
          variant: "success",
        });
      } else {
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
