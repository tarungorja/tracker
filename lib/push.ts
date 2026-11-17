import { connectToDatabase } from "@/lib/db";
import { getAdminMessaging } from "@/lib/firebase/admin";
import { PushToken, Session } from "@/models";

export interface PushPayload {
  title: string;
  body: string;
  /** Page opened when the notification is clicked. */
  url?: string;
  /** Notifications with the same tag replace each other. */
  tag?: string;
}

// Only tokens Firebase says are gone are pruned; "invalid-argument" can also mean a bad
// payload, so it must not delete working tokens.
const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

/**
 * Sends a web push to every browser registered for the user. Data-only message:
 * the service worker (app/firebase-messaging-sw.js/route.ts) builds the notification.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number; error?: string }> {
  await connectToDatabase();

  // Deliver to every device still logged in as this user. A token whose session has ended
  // (expired without signing out) is dropped. Tokens saved before sessions were tracked
  // have no sessionId and are kept until they re-register.
  const sessions = await Session.find({ userId, expiresAt: { $gt: new Date() } })
    .select("_id")
    .lean();
  const sessionIds = sessions.map((s) => s._id);
  await PushToken.deleteMany({ userId, sessionId: { $exists: true, $nin: sessionIds } });
  const docs = await PushToken.find({
    userId,
    $or: [{ sessionId: { $in: sessionIds } }, { sessionId: { $exists: false } }],
  })
    .select("token")
    .lean();
  const tokens = Array.from(new Set(docs.map((d) => d.token)));
  if (tokens.length === 0) return { sent: 0, failed: 0 };

  const messaging = getAdminMessaging();
  const data = {
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/today",
    tag: payload.tag ?? "reminder",
  };

  // One request per token via send() (HTTP/1.1). sendEachForMulticast() uses HTTP/2, which
  // fails behind some proxies/firewalls with ERR_HTTP2_INVALID_SESSION.
  const results = await Promise.allSettled(
    tokens.map((token) =>
      messaging.send({ token, data, webpush: { headers: { Urgency: "high", TTL: "3600" } } }),
    ),
  );

  const dead: string[] = [];
  let sent = 0;
  let firstError: string | undefined;
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      sent += 1;
      return;
    }
    const err = result.reason as { code?: string; message?: string };
    firstError ??= err.code ? `${err.code}: ${err.message ?? ""}` : (err.message ?? "Unknown error");
    const token = tokens[i];
    if (err.code && token && DEAD_TOKEN_CODES.has(err.code)) dead.push(token);
  });
  if (dead.length > 0) await PushToken.deleteMany({ token: { $in: dead } });

  return { sent, failed: tokens.length - sent, error: firstError };
}
