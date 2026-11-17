import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

function loadApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT. Generate a private key in Firebase console > Project settings > Service accounts and paste the JSON (one line) into .env.development.",
    );
  }

  let credentials: { project_id: string; client_email: string; private_key: string };
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON (it must be on a single line).");
  }

  return initializeApp({
    credential: cert({
      projectId: credentials.project_id,
      clientEmail: credentials.client_email,
      // Env files often store the key with literal "\n" sequences.
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
