// Service worker served at /firebase-messaging-sw.js (scope "/").
// It receives FCM web pushes and shows the notification. Messages are sent data-only
// by the API (tracker-api: app/services/push_service.py), so no Firebase SDK is needed here.
// It stays in the UI because browsers require a service worker to be served from the app's origin.
const SERVICE_WORKER = `
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { body: event.data ? event.data.text() : "" };
  }
  // FCM wraps custom fields in "data"; tolerate a "notification" block or a flat payload too.
  const info = Object.assign({}, payload.notification, payload.data || payload);
  const title = info.title || "Medication reminder";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: info.body || "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: info.tag || "reminder",
      renotify: true,
      data: { url: info.url || "/today" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/today", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
`;

export const dynamic = "force-static";

export function GET() {
  return new Response(SERVICE_WORKER, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
