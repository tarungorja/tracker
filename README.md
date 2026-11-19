# 💊 Medication Tracker

A **Next.js 15** app for tracking your own medications (Indian Standard Time),
logging daily completion, and getting a push notification when a dose is due.
Sign in with just your email: a one-time code is sent to you, no passwords.

This repo is the **UI only**. All business logic (auth, medications, doses, statistics,
reminders, email, push) lives in a separate **FastAPI backend**, `tracker-api`, which this app
calls over HTTP. See [Architecture](#-architecture).

---

## ✨ Features

- **Email sign-up / sign-in with one-time codes** — codes are emailed through
  Brevo, stored hashed in MongoDB, and deleted once used.
- **Your own data** — every user adds their own medications; nothing is shared
  between accounts.
- **Medications** — add a medication with a name, description, instructions,
  one or more times (time picker) and the **days of the week** to take it.
  Edit, pause or delete any time.
- **Today** — a timeline of your doses for the day with Pending / Completed /
  Missed states.
- **Dashboard** — progress ring, completed / remaining / streak, next dose and a
  consistency heatmap.
- **Statistics** — overall and monthly completion, current and longest streaks,
  missed doses, per-medication bars and an adherence heatmap.
- **Dose reminders** — web push notifications (Firebase Cloud Messaging) at each
  scheduled time. Right after signing in, if the browser hasn't decided yet, it shows its own
  "Allow / Block" notification popup; the bell in the top bar turns reminders on or off later.
- **Family** — a father creates a one-time invite code (Family page); his son enters it to follow
  his account read-only: today's doses (taken / missed), streak, heatmap and a log of medication
  changes. When a dose has been missed the son gets a **Remind** button that pushes a
  "you missed a dose" notification to his father's devices (only for missed doses, 5-minute
  cooldown). Either side can end the connection at any time.
- **UI** — glass cards, dark mode, responsive layout, Framer Motion, loading
  skeletons and error boundaries.

> The **Wellness tracker** code is still in the repo but hidden for now (no nav
> item, `/wellness` returns 404). To bring it back, restore the page at
> `app/(app)/wellness/page.tsx`, the nav item in
> `components/layout/nav-config.ts` and the section on the dashboard page.

---

## 🏛️ Architecture

```
Browser ──► Next.js UI (this repo) ──/api/v1/*──► FastAPI (tracker-api) ──► MongoDB
              │  Server Components call the API directly (cookie forwarded)
              └  Client components call same-origin /api/v1/*, proxied by next.config.ts
```

- The API sets an **HttpOnly `session` cookie**. Because browser calls go through the Next.js
  proxy (a rewrite in `next.config.ts`), the cookie stays first-party: no CORS setup needed.
- Server Components fetch data with `lib/api/server.ts`, forwarding the visitor's cookie.
  A `401` redirects to `/signin`.
- Client components call `lib/api/*.ts`, which resolves to `{ ok: true, ... }` or
  `{ ok: false, error }`. After a write, components call `router.refresh()` to re-render the
  page with fresh server data.
- The UI holds **no** database, email, Firebase-admin or scheduling code.

## 🧱 Tech stack

| Layer      | Choice                                               |
| ---------- | ---------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + React 19 + TypeScript      |
| Styling    | Tailwind CSS + shadcn/ui components                  |
| Backend    | FastAPI (`tracker-api`): MongoDB, Brevo email, FCM   |
| Push (web) | Firebase client SDK (browser token) + service worker |
| Hosting    | Vercel, or any host that runs `next start`           |

---

## 📁 Project structure

```
app/
  (auth)/                signin/ and signup/ pages (no app shell)
  (app)/                 signed-in pages: dashboard (/dashboard), today, medications,
                         statistics, account (+ hidden wellness) inside the app shell
  privacy/, delete-account/  public pages (no sign-in needed): the privacy policy and how to
                         delete an account. Give these two URLs to Google Play.
  firebase-messaging-sw.js/  service worker that shows push notifications
components/              ui/, layout/, auth/, medications/, today/, dashboard/, …
lib/
  api/
    types.ts             response types (mirror the API's schemas)
    client.ts            browser fetch wrapper for /api/v1/*
    server.ts            Server Component access to the API (forwards the cookie)
    auth.ts, medications.ts, doses.ts, wellness.ts, push.ts   typed endpoint calls
  firebase/client.ts     browser push-token registration
  time.ts                IST display helpers
middleware.ts            "/" is not a page: it redirects to /dashboard when a session cookie
                         exists, otherwise to /signin. Signed-out visitors to any other page go
                         to /signin (except /signin, /signup, /privacy, /delete-account).
```

---

## 🚀 Local setup

1. Start the backend first (see `tracker-api/README.md`): it needs MongoDB, Brevo and
   Firebase credentials. Default address: `http://localhost:8000`.
2. In this repo:

```bash
npm install
```

Create `.env.development` (it is gitignored) with:

| Variable | What it is |
| -------- | ---------- |
| `API_URL` | Base URL of the FastAPI backend, e.g. `http://localhost:8000`. Server-side only. |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` | Firebase web app config (public). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Support / privacy contact email (Account → Help & support, the privacy and delete-account pages, the sign-in pages). Defaults to `tarungorja1647@gmail.com`; set only to override. |
| `NEXT_PUBLIC_SUPPORT_PHONE` | Support phone number in international form. Defaults to `+919347294521`; set only to override. |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web push certificate key from Firebase console → Cloud Messaging. |
| `NODE_OPTIONS=--use-system-ca` | Only if your network intercepts HTTPS (corporate proxy) and Node rejects its certificate. |

Then:

```bash
npm run dev            # loads .env.development
```

Open <http://localhost:3000>, sign up with your email, and add your medications.
Secrets (database, email, Firebase service account, `AUTH_SECRET`, `CRON_SECRET`) belong to the
backend's `.env`, not here. Never commit real credentials.

> `API_URL` is read when Next.js **starts/builds** (the proxy rewrite is created then), so
> restart the dev server after changing it.

---

## 🔔 Dose reminders

Reminders are sent by the **backend**: a job finds doses due in the last 5 minutes and pushes one
notification per user per time slot (each dose only once). The API runs this job itself every
minute (`REMINDER_TIMER_ENABLED`); on serverless hosting call its
`/api/v1/cron/send-reminders` endpoint from a scheduler instead. Details are in the
`tracker-api` README.

In the UI, each user turns reminders on per browser with the bell icon (registers this
browser's FCM token with the API), and clicking the bell again sends a test notification.
Signing out removes that browser's token.

---

## ▲ Deploy to Vercel

1. Deploy `tracker-api` somewhere that can run a long-lived Python process (a VM, container or
   similar) so its reminder timer keeps running.
2. Push this repo to GitHub and import it in Vercel.
3. Set **Build Command** to `next build` (the `build` script expects a
   `.env.production` file, which should not be committed).
4. Add `API_URL` (the public URL of the backend) and the `NEXT_PUBLIC_FIREBASE_*` variables in
   Project Settings → Environment Variables. `API_URL` and `NEXT_PUBLIC_*` must be set before the
   first build.
5. Set `CORS_ORIGINS` on the backend to your UI origin only if the browser ever calls the API
   directly; the Next.js proxy does not need it.

---

## 🧰 Scripts

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Dev server (`.env.development`).                         |
| `npm run dev:prod`     | Dev server with the production env file.                 |
| `npm run build`        | Production build (`.env.production`).                    |
| `npm run build:dev`    | Build with the development env file.                     |
| `npm run start`        | Run the production build (`.env.production`).            |
| `npm run start:dev`    | Run a build with the development env file.               |
| `npm run typecheck`    | Strict TypeScript check (`tsc --noEmit`).                |
| `npm run lint`         | ESLint.                                                  |

---

## 🗃️ Data model

The database schema and all queries now live in the backend (`tracker-api`: `app/db/`). The JSON
shapes the UI consumes are in `lib/api/types.ts`.

---

## 📝 Notes

- The entire app operates on **Asia/Kolkata (IST, UTC+05:30)** regardless of
  where the server runs: schedule times, "today", weekdays and streaks are all IST.
- Sessions live in MongoDB (managed by the API) and are referenced by an HttpOnly cookie; the
  middleware only checks that the cookie exists, and the API validates it on every request.
- shadcn/ui components live in `components/ui` and are yours to customise.
