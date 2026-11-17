import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Parses FIREBASE_SERVICE_ACCOUNT leniently. Accepts:
 *  - the raw JSON (single or multi-line),
 *  - the JSON wrapped in single/double quotes (common when pasting into hosting dashboards),
 *  - JSON whose private key contains real line breaks instead of "\n",
 *  - the JSON encoded as base64.
 */
function parseServiceAccount(raw: string): ServiceAccount {
  let text = raw.trim();

  if (text.length > 1 && /^(['"]).*\1$/s.test(text)) {
    // A double-quoted value may be a JSON string holding the JSON; unwrap it properly.
    const unwrapped = text.startsWith('"') ? tryParse(text) : undefined;
    text = typeof unwrapped === "string" ? unwrapped : text.slice(1, -1);
  }

  if (!text.startsWith("{")) {
    const decoded = Buffer.from(text, "base64").toString("utf8").trim();
    if (decoded.startsWith("{")) text = decoded;
  }

  const candidates = [
    text,
    // Real line breaks inside the private key string are invalid JSON; escape them.
    text.replace(/("private_key"\s*:\s*")([\s\S]*?)("\s*[,}])/, (_m, a, key, c) =>
      `${a}${String(key).replace(/\r?\n/g, "\\n")}${c}`,
    ),
    // Over-escaped quotes (\"), e.g. from a JSON string pasted without unwrapping.
    text.replace(/\\"/g, '"'),
  ];

  for (const candidate of candidates) {
    const value = tryParse(candidate) as Partial<ServiceAccount> | undefined;
    if (value && value.project_id && value.client_email && value.private_key) {
      return value as ServiceAccount;
    }
  }

  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT could not be read as the service-account JSON. Paste the whole contents of the downloaded key file as the value (no extra quotes), or its base64 encoding.",
  );
}

function loadApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT. Generate a private key in Firebase console > Project settings > Service accounts and add the JSON to your environment variables.",
    );
  }

  const credentials = parseServiceAccount(raw);

  return initializeApp({
    credential: cert({
      projectId: credentials.project_id,
      clientEmail: credentials.client_email,
      // Env values often store the key with literal "\n" sequences.
      privateKey: credentials.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminMessaging(): Messaging {
  return getMessaging(loadApp());
}

export function isPushConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
}
