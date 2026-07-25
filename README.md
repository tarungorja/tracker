# 💊 Hair Reminder

A beautiful, Apple-Health–inspired **Next.js 15** app that tracks your hair-care
medications, emails you reminders on schedule (Indian Standard Time), records
daily completion, shows rich statistics, and includes a private wellness
tracker.

Everything runs **inside a single Next.js app** — Server Components, Server
Actions and Route Handlers. No Express, no separate backend. Deploys to the
**free Vercel Hobby plan** in minutes.

---

## ✨ Features

- **Dashboard** — today's progress ring, completed / remaining / streak, next
  reminder, medication list and a consistency heatmap.
- **Today** — a vertical timeline (8 AM · 10 AM · 2 PM · 9 PM) with per-dose
  Pending / Completed / Missed states.
- **Medications** — a card per medication with times, formatted instructions,
  per-dose completion toggles, a 14-day history strip, enable/disable switch,
  plus add / edit / delete.
- **Reminder emails** — sent every 5 minutes via **Vercel Cron → Resend** with a
  big **“I have completed this”** button that marks the dose done.
- **Statistics** — overall & monthly completion %, current & longest streaks,
  missed doses, emails sent, per-medication bars and an adherence heatmap.
- **Wellness tracker** — private daily count with **+1 / −1 / Reset**, notes,
  calendar, weekly & monthly charts, yearly totals, average per week, current &
  longest clean streaks.
- **UI** — rounded glass cards, dark mode, fully responsive, Framer Motion
  animations, Lucide icons, loading skeletons and error boundaries.

---

## 🧱 Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + React 19 + TypeScript    |
| Styling    | Tailwind CSS + shadcn/ui components                |
| Animation  | Framer Motion                                      |
| Icons      | Lucide                                             |
| Database   | MongoDB Atlas + Mongoose                           |
| Email      | Resend                                             |
| Scheduling | Vercel Cron (every 5 minutes)                      |
| Hosting    | Vercel (free Hobby plan)                           |

---

## 📁 Project structure

```
app/                     App Router pages & route handlers
  page.tsx               Dashboard
  today/                 Timeline
  medications/           Medication cards
  statistics/            Stats & charts
  masturbation/          Wellness tracker
  api/
    cron/reminders/      Vercel Cron target (sends reminder emails)
    complete/            "I have completed this" email link target
  layout.tsx  loading.tsx  error.tsx  not-found.tsx  globals.css
components/
  ui/                    shadcn/ui primitives (button, card, dialog, …)
  layout/                sidebar, topbar, mobile nav, theme toggle
  charts/                progress ring, heatmap, bar chart (pure SVG)
  common/                page header, stat card, skeletons, config notice
  dashboard/ today/ medications/ masturbation/ statistics/   feature views
  doses/                 shared interactive dose item
  providers/             theme + toast providers
actions/                 Server Actions (logs, medications, masturbation)
lib/
  db.ts                  Reusable cached Mongoose connection
  env.ts                 Type-safe env access
  time.ts                IST helpers (the app runs entirely on IST)
  reminders/engine.ts    Reminder-cycle logic (find due → send → dedupe)
  email/                 Resend client + HTML email template
  data/                  Server-side query helpers per page
  seed.ts                Auto-seed medications if empty
models/                  Mongoose models (Medication, DailyLog, …)
hooks/                   useLiveClock, useToast
scripts/seed.ts          `npm run seed` CLI
vercel.json              Cron schedule
```

---

## 🚀 Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#   → fill in MONGODB_URI, RESEND_API_KEY, FROM_EMAIL, NOTIFICATION_EMAIL

# 3. (Optional) seed the medications manually — the app also self-seeds
npm run seed

# 4. Run the dev server
npm run dev
```

Open <http://localhost:3000>. The four medications are inserted automatically on
first load if the collection is empty.

---

## 🔐 Environment variables

| Variable              | Required | Description                                                                 |
| --------------------- | :------: | --------------------------------------------------------------------------- |
| `MONGODB_URI`         |    ✅    | MongoDB Atlas connection string (include the database name).                |
| `RESEND_API_KEY`      |    ✅    | Resend API key (starts with `re_`). Also signs email completion links.      |
| `FROM_EMAIL`          |    ✅*   | Verified sender, e.g. `Hair Reminder <reminders@yourdomain.com>`.           |
| `NOTIFICATION_EMAIL`  |    ✅    | Inbox that receives the reminders (your email).                             |
| `NEXT_PUBLIC_APP_URL` |    ⬜    | Public base URL for email links. Auto-detected from Vercel if omitted.      |
| `CRON_SECRET`         |    ⬜    | If set, the cron endpoint requires this Bearer token (Vercel adds it).      |

\* `FROM_EMAIL` falls back to Resend's shared `onboarding@resend.dev` sender for
testing, but you should verify your own domain for production.

---

## 🍃 MongoDB Atlas setup

1. Create a free account at <https://www.mongodb.com/atlas> and a **free M0
   cluster**.
2. **Database Access** → *Add New Database User* → username + password (SCRAM).
3. **Network Access** → *Add IP Address* → **Allow access from anywhere**
   (`0.0.0.0/0`) so Vercel's serverless functions can connect.
4. **Connect → Drivers** → copy the connection string and replace `<password>`
   and add a database name:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/hair-reminder?retryWrites=true&w=majority
   ```
5. Put it in `MONGODB_URI`. Collections and indexes are created automatically.

---

## 📧 Resend setup

1. Sign up at <https://resend.com> and create an **API key** → set
   `RESEND_API_KEY`.
2. **Testing:** leave `FROM_EMAIL` as `Hair Reminder <onboarding@resend.dev>` —
   Resend lets you email your own account address from this shared sender.
3. **Production:** **Domains → Add Domain**, add the DNS records Resend shows,
   wait for verification, then set `FROM_EMAIL` to an address on that domain
   (e.g. `reminders@yourdomain.com`).
4. Set `NOTIFICATION_EMAIL` to wherever you want reminders delivered.

---

## ⏰ How reminders work

- `vercel.json` registers a cron job that calls **`/api/cron/reminders` every 5
  minutes**:
  ```json
  { "crons": [{ "path": "/api/cron/reminders", "schedule": "*/5 * * * *" }] }
  ```
- The handler computes the **current IST time**, finds every enabled dose whose
  scheduled time falls **within the next 5 minutes**, and emails it via Resend.
- A unique `(date, medication, time)` row in `ReminderHistory` **guarantees no
  duplicate emails** — the dose is atomically “claimed” before sending and rolled
  back if the email fails, so a later run retries.
- Each email contains the medication name, current time, instructions and a big
  **“I have completed this”** button. It links to `/api/complete` with an
  HMAC-signed token; clicking it marks the dose complete in `DailyLog`.

> **Vercel Hobby note:** cron jobs on the free plan run on Vercel's schedule
> (roughly every 5 minutes, best-effort). That's perfect for medication windows.

---

## ▲ Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, **Add New → Project** and import the repo.
3. Add the environment variables from the table above under **Settings →
   Environment Variables** (Production + Preview).
4. (Recommended) generate a `CRON_SECRET`:
   ```bash
   openssl rand -hex 32
   ```
   Add it as `CRON_SECRET`; Vercel automatically sends it to your cron endpoint.
5. **Deploy.** Vercel reads `vercel.json` and registers the cron job
   automatically — no extra config needed.
6. Open your deployment. Medications seed on first load; reminders start flowing
   at the next scheduled window.

### Verifying the cron manually

```bash
# If CRON_SECRET is set:
curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/reminders
# Otherwise:
curl https://your-app.vercel.app/api/cron/reminders
```

You'll get a JSON summary: `{ due, sent, skippedDuplicate, failed, ... }`.

---

## 🧰 Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack).            |
| `npm run build`     | Production build.                            |
| `npm run start`     | Run the production build.                    |
| `npm run seed`      | Seed medications if the collection is empty. |
| `npm run typecheck` | Strict TypeScript check (`tsc --noEmit`).    |
| `npm run lint`      | ESLint.                                      |

---

## 🗃️ Data model

```ts
Medication       { name, description, instructions, scheduleTimes[], enabled, timestamps }
DailyLog         { date, medicationName, scheduledTime, completed, completedAt, notes }
ReminderHistory  { date, medicationName, scheduledTime, emailSent, sentAt }
MasturbationLog  { date, count, notes, timestamps }
```

`DailyLog` and `ReminderHistory` track completion and emails **per dose**
(`date + medicationName + scheduledTime`), which is what makes twice-daily
medications, the timeline, streaks and duplicate-prevention all work correctly.

---

## 📝 Notes

- The entire app operates on **Asia/Kolkata (IST, UTC+05:30)** regardless of
  where the server runs — schedule times, “today”, streaks and the cron window
  are all IST.
- shadcn/ui components live in `components/ui` and are yours to customise.
- The wellness tracker stores data only in your own database — it is completely
  private to your deployment.
```
