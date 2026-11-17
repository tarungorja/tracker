# 💊 Hair Health Tracker

A **Next.js 15** app for tracking your own medications (Indian Standard Time),
logging daily completion, and getting a push notification when a dose is due.
Sign in with just your email: a one-time code is sent to you, no passwords.

Everything runs **inside a single Next.js app** — Server Components, Server
Actions and Route Handlers. No separate backend.

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
  scheduled time. Turn them on with the bell in the top bar.
- **UI** — glass cards, dark mode, responsive layout, Framer Motion, loading
  skeletons and error boundaries.

> The **Wellness tracker** code is still in the repo but hidden for now (no nav
> item, `/wellness` returns 404). To bring it back, restore the page at
> `app/(app)/wellness/page.tsx`, the nav item in
> `components/layout/nav-config.ts` and the section on the dashboard page.

---

## 🧱 Tech stack

| Layer      | Choice                                               |
| ---------- | ---------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + React 19 + TypeScript      |
| Styling    | Tailwind CSS + shadcn/ui components                  |
| Database   | MongoDB Atlas + Mongoose                             |
| Email      | Brevo transactional email API (over HTTPS)           |
| Push       | Firebase Cloud Messaging (web push)                  |
| Validation | Zod                                                  |
| Hosting    | Vercel, or any host that runs `next start`           |

---

## 📁 Project structure

```
app/
  (auth)/                signin/ and signup/ pages (no app shell)
  (app)/                 signed-in pages: dashboard, today, medications,
                         statistics (+ hidden wellness) inside the app shell
  api/cron/send-reminders/   reminder job endpoint (secured with CRON_SECRET)
  firebase-messaging-sw.js/  service worker that shows push notifications
components/              ui/, layout/, auth/, medications/, today/, dashboard/, …
actions/                 Server Actions: auth, push, medications, logs, wellness
lib/
  auth/                  OTP generation/hashing, Mongo-backed sessions
  data/                  Server-side query helpers (all scoped by userId)
  firebase/              admin (server) and client (browser) setup
  db.ts                  Cached Mongoose connection
  email.ts               Brevo email sender
  push.ts, reminders.ts  Sending pushes and finding due doses
  time.ts                IST helpers (the app runs entirely on IST)
models/                  User, Otp, Session, Medication, DailyLog,
                         PushToken, ReminderSent
middleware.ts            Redirects signed-out visitors to /signin
instrumentation*.ts      Starts the reminder timer (see below)
scripts/                 One-off scripts (migration)
```

---

## 🚀 Local setup

```bash
npm install
```

Create `.env.development` (it is gitignored) with:

| Variable | What it is |
| -------- | ---------- |
| `MONGODB_URI` | Atlas connection string; the path must end with `/health`. |
| `AUTH_SECRET` | Long random string used to hash one-time codes. |
| `BREVO_API_KEY` | Brevo **API** key (`xkeysib-…`), not the SMTP key. |
| `EMAIL_FROM` | Sender address verified in Brevo (Senders, Domains & Dedicated IPs). |
| `EMAIL_FROM_NAME` | Display name on the email, e.g. `Tracker-Otp`. |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` | Firebase web app config (public). |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web push certificate key from Firebase console → Cloud Messaging. |
| `FIREBASE_SERVICE_ACCOUNT` | Service-account JSON on **one line** (Firebase console → Service accounts → Generate new private key). Secret. |
| `CRON_SECRET` | Random string; callers of the reminder endpoint must send it. |
| `NODE_OPTIONS=--use-system-ca` | Only if your network intercepts HTTPS (corporate proxy) and Node rejects its certificate. |

Generate secrets with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Then:

```bash
npm run migrate:auth   # once per database: swaps the old global unique indexes for per-user ones
npm run dev            # loads .env.development
```

Open <http://localhost:3000>, sign up with your email, and add your medications.
Never commit real credentials.

---

## 🍃 MongoDB Atlas setup

1. Create a free account at <https://www.mongodb.com/atlas> and a free M0 cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → allow `0.0.0.0/0` so serverless hosts (no fixed IPs) can connect.
4. **Connect → Drivers** → copy the connection string and set it as `MONGODB_URI`.
   Collections and indexes are created automatically.

---

## 🔔 Dose reminders

Reminders are sent by a job that finds doses due in the last 5 minutes and
pushes one notification per user per time slot. Each dose is reminded only once,
so overlapping runs are safe.

- **Self-hosted (`next start`) and development:** a timer inside the server runs
  the job every minute (`instrumentation-node.ts`). Set
  `DISABLE_REMINDER_TIMER=1` to turn it off.
- **Vercel / serverless:** the timer does not run (instances are short-lived).
  Call the endpoint every minute instead, with the secret:

  ```
  GET https://<your-domain>/api/cron/send-reminders
  Authorization: Bearer <CRON_SECRET>
  ```

  Use Vercel Cron (Pro plan, schedule `* * * * *`; Vercel adds the header for
  you when `CRON_SECRET` is set) or a free external service such as cron-job.org.

Each user turns reminders on per browser with the bell icon, and clicking the
bell again sends a test notification. Signing out removes that browser's token.

---

## ▲ Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Set **Build Command** to `next build` (the `build` script expects a
   `.env.production` file, which should not be committed).
3. Add the environment variables from the table above in Project Settings →
   Environment Variables. Use a **new** `AUTH_SECRET` and `CRON_SECRET` for
   production, paste `FIREBASE_SERVICE_ACCOUNT` as raw JSON, and skip
   `NODE_OPTIONS`. `NEXT_PUBLIC_*` values must be set before the first build.
4. Run `npm run migrate:auth` once against your production database if it is not
   the one you already migrated.
5. Set up the per-minute reminder caller (see above).
6. To let anyone receive sign-in codes, use a sender in Brevo that you control
   (ideally on a verified domain) as `EMAIL_FROM`.

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
| `npm run migrate:auth` | One-off index migration for per-user data.               |
| `npm run typecheck`    | Strict TypeScript check (`tsc --noEmit`).                |
| `npm run lint`         | ESLint.                                                  |

---

## 🗃️ Data model

```ts
User         { email, timestamps }
Otp          { email, purpose, codeHash, attempts, sentAt, expiresAt }   // TTL
Session      { tokenHash, userId, expiresAt }                            // TTL
Medication   { userId, name, description, instructions, scheduleTimes[], daysOfWeek[], enabled, timestamps }
DailyLog     { userId, date, medicationName, scheduledTime, completed, completedAt, notes, count }
PushToken    { userId, token, userAgent, timestamps }
ReminderSent { userId, date, medicationName, scheduledTime }             // TTL
```

- `daysOfWeek` uses `0` = Sunday … `6` = Saturday. A medication is due on a date
  when that date's weekday is in the list.
- `DailyLog` tracks completion **per dose** (`userId + date + medicationName +
  scheduledTime`), so twice-daily medications, the timeline and streaks all work.
- Every query and action is scoped by `userId`, so accounts never see each
  other's data. Documents created before accounts existed have no `userId` and
  are ignored.
- Wellness (hidden) reuses `dailylogs` with the reserved `__wellness__` name; all
  medication queries exclude it.

---

## 📝 Notes

- The entire app operates on **Asia/Kolkata (IST, UTC+05:30)** regardless of
  where the server runs: schedule times, "today", weekdays and streaks are all IST.
- Sessions live in MongoDB and are referenced by an httpOnly cookie; the
  middleware only checks that the cookie exists, and pages check it against the
  database.
- shadcn/ui components live in `components/ui` and are yours to customise.
