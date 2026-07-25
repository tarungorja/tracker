# 💊 MedTrack — Personal Medication & Wellness Tracker

A production-quality, single-user medication reminder and habit tracker built
entirely inside **Next.js 16 (App Router)** — no separate backend. It reminds you
to take your medicines, tracks completion, keeps history, sends beautiful email
reminders & summaries, and includes a private wellness (masturbation) tracker.

Everything runs with `npm install` + `npm run dev`. MongoDB is the only external
service required; email is optional.

---

## ✨ Features

- **Dashboard** — live clock, progress ring, completion %, remaining doses, next
  reminder, current streak, missed count, today's wellness count, and a
  time-anchored timeline of the day's doses.
- **Medication schedule** — the four configured medications with full
  instructions, warnings and per-dose times.
- **Complete / Skip / Undo** on every dose, with optimistic UI and notes.
- **Auto-miss** — a pending dose is automatically marked *missed* 60 minutes
  after its scheduled time.
- **Email reminders** (Resend) — sent at each dose time with instructions and
  one-click **Mark complete** / **Skip** buttons that link back into the app.
  Duplicate reminders are prevented atomically.
- **Daily summary** (10 PM by default) and **weekly summary** (Sundays).
- **Calendar** — monthly grid colored green / yellow / red (completed / skipped /
  missed); tap any day to review or backfill it.
- **Analytics** — completion %, weekly & monthly adherence, current & longest
  streak, per-medication adherence, most skipped / missed, average completion
  time.
- **Wellness tracker** — today's count with quick +/− & reset, clean-streak,
  highest daily, monthly average, daily/weekly/monthly/yearly charts, a
  contribution-style heatmap and private notes.
- **Apple-inspired UI** — glassmorphism, rounded cards, smooth animations,
  loading skeletons, **dark mode**, fully responsive, **PWA** (installable +
  offline app shell).

## 🧱 Tech stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn-style UI ·
MongoDB + Mongoose · Server Actions · Route Handlers · Resend · React Hook Form ·
Zod · date-fns · Lucide icons.

> There is **no** Express/Nest/standalone server. All data access happens in
> Server Components, Server Actions and Route Handlers.

---

## 🚀 Getting started

### 1. Prerequisites

- **Node.js 18.18+** (20+ recommended)
- **MongoDB** — a local instance _or_ a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- _(optional)_ a [Resend](https://resend.com) account for email

### 2. Install

```bash
npm install
```

### 3. Configure environment

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

| Variable         | Required | Description                                              |
| ---------------- | :------: | -------------------------------------------------------- |
| `MONGODB_URI`    |    ✅    | MongoDB connection string                                |
| `RESEND_API_KEY` |    –     | Resend API key (emails are skipped if empty)             |
| `RESEND_FROM`    |    –     | Verified sender, e.g. `MedTrack <onboarding@resend.dev>` |
| `USER_EMAIL`     |    –     | Where reminders/summaries are sent                       |
| `APP_URL`        |    –     | Base URL used to build email links                       |
| `CRON_SECRET`    |    –     | Protects `/api/reminders` (recommended in production)    |

### 4. Seed the database

Creates settings, the four medications, today's doses, and ~3 weeks of demo
history so the charts look alive:

```bash
npm run seed          # with demo history
npm run seed:reset    # settings + medications + today only (no demo data)
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## ⏰ Reminders (cron)

The reminder system is a single endpoint that should be called **every minute**:

```
GET /api/reminders
```

Each call: ensures today's doses exist, auto-marks overdue doses as missed, sends
any due reminder emails (deduplicated), and sends the daily/weekly summaries when
their time arrives. If `CRON_SECRET` is set, pass it as
`Authorization: Bearer <secret>` or `?secret=<secret>`.

**Options to schedule it:**

- **Vercel Cron** — [`vercel.json`](./vercel.json) is included. (Per-minute
  schedules require a Vercel Pro plan; Hobby runs daily.)
- **cron-job.org / EasyCron** — point a job at
  `https://your-app.com/api/reminders?secret=YOUR_SECRET` every minute.
- **GitHub Actions** — a scheduled workflow that `curl`s the endpoint.
- **Local testing** —
  ```bash
  curl http://localhost:3000/api/reminders
  ```

---

## 🗂️ Project structure

```
src/
├─ app/
│  ├─ page.tsx                 # Dashboard
│  ├─ medications/             # Schedule
│  ├─ calendar/                # Monthly calendar + day history
│  ├─ analytics/               # Charts & stats
│  ├─ masturbation/            # Wellness tracker
│  ├─ settings/                # Settings form
│  ├─ api/
│  │  ├─ reminders/route.ts    # Cron endpoint
│  │  └─ action/route.ts       # Email complete/skip links
│  ├─ layout.tsx  manifest.ts  icon.svg  loading/error/not-found
├─ components/                 # ui/ (shadcn-style), layout/, dashboard/,
│                              # charts/, calendar/, wellness/, settings/
├─ lib/
│  ├─ db.ts  env.ts  time.ts  constants.ts  utils.ts
│  ├─ models/                  # Mongoose schemas (7 collections)
│  ├─ data/                    # Read/query layer
│  ├─ actions/                 # Server Actions (use server)
│  ├─ reminders/               # Cron engine + outcome recorder
│  ├─ email/                   # Resend client + HTML templates
│  └─ validation/              # Zod schema + RHF resolver
├─ scripts/seed.ts             # Seed script
└─ types/
```

### MongoDB collections

`settings` · `medications` · `daily_logs` · `reminders` ·
`notification_history` · `masturbation_logs` · `analytics_cache`

---

## 🛠️ Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the dev server                 |
| `npm run build`      | Production build                     |
| `npm start`          | Run the production build             |
| `npm run lint`       | ESLint                               |
| `npm run typecheck`  | `tsc --noEmit`                       |
| `npm run seed`       | Seed settings + meds + demo history  |
| `npm run seed:reset` | Seed without demo history            |

---

## ☁️ Deployment

1. Push to GitHub and import into **Vercel** (or any Node host).
2. Set the environment variables from `.env.example`.
3. Set `APP_URL` to your deployed URL.
4. Configure the cron (see above). Set `CRON_SECRET` and add it to your
   scheduler.
5. Run `npm run seed` once against the production database.

---

## 🔒 Notes

- **Single user, no auth** by design — intended for personal/self-hosted use.
  Set `CRON_SECRET` and keep your deployment private.
- All timezone reasoning is driven by the timezone in **Settings**
  (default `Asia/Kolkata`), so "today" is always correct for you.
- Emails degrade gracefully: without `RESEND_API_KEY` the app works fully, it
  just doesn't send mail.
