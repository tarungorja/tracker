"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

// Web app config. These values are public by design (they identify the project, not
// grant access) and come from NEXT_PUBLIC_* env vars.
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

const TOKEN_STORAGE_KEY = "push-token";

export function getStoredPushToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storePushToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

const OPT_OUT_KEY = "push-opt-out";

/** True once the user explicitly turned reminders off on this browser. */
export function isPushOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPushOptOut(optedOut: boolean) {
  try {
    if (optedOut) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {}
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;
  const { isSupported } = await import("firebase/messaging");
  return isSupported();
}

/**
 * Registers the service worker and returns this browser's FCM token. Asks for permission
 * only when `prompt` is true (a user gesture); otherwise it requires permission to be
 * already granted, so it never shows a surprise permission dialog.
 */
export async function requestPushToken(prompt = true): Promise<string> {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) throw new Error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY.");

  const permission =
    Notification.permission === "default" && prompt
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") {
    throw new Error("Notifications are blocked. Allow them in your browser's site settings.");
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  const { getMessaging, getToken } = await import("firebase/messaging");
  const token = await getToken(getMessaging(getFirebaseApp()), {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("Could not get a notification token from Firebase.");

  storePushToken(token);
  return token;
}

/** Revokes this browser's token with Firebase and forgets it locally. */
export async function revokePushToken(): Promise<string | null> {
  const token = getStoredPushToken();
  storePushToken(null);
  try {
    const { getMessaging, deleteToken } = await import("firebase/messaging");
    await deleteToken(getMessaging(getFirebaseApp()));
  } catch {}
  return token;
}
