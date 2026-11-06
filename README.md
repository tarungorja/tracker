# 💊 Hair Health Tracker

A beautiful, Apple-Health–inspired **Next.js 15** app that tracks your hair-care
medications (Indian Standard Time), records daily completion, shows rich
statistics, and includes a private wellness tracker.

Everything runs **inside a single Next.js app** — Server Components, Server
Actions and Route Handlers. No Express, no separate backend. Deploys to the
**free Vercel Hobby plan** in minutes.

---

## ✨ Features

- **Dashboard** — today's progress ring, completed / remaining / streak, next
  dose, medication list and a consistency heatmap.
- **Today** — a vertical timeline (8 AM · 10 AM · 2 PM · 9 PM) with per-dose
  Pending / Completed / Missed states.
- **Medications** — a card per medication with times, formatted instructions,
  per-dose completion toggles, a 14-day history strip, enable/disable switch,
  plus add / edit / delete.
- **Statistics** — overall & monthly completion %, current & longest streaks,
  missed doses, per-medication bars and an adherence heatmap.
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
| Hosting    | Vercel (free Hobby plan)                           |

---

## 📁 Project structure

```
app/                     App Router pages & route handlers
  page.tsx               Dashboard
  today/                 Timeline
  medications/           Medication cards
  statistics/            Stats & charts
  wellness/              Wellness tracker
  layout.tsx  loading.tsx  error.tsx  not-found.tsx  globals.css
components/
  ui/                    shadcn/ui primitives (button, card, dialog, …)
  layout/                sidebar, topbar, mobile nav, theme toggle
  charts/                progress ring, heatmap, bar chart (pure SVG)
  common/                page header, stat card, skeletons, config notice
  dashboard/ today/ medications/ wellness/ statistics/   feature views
  doses/                 shared interactive dose item
  providers/             theme + toast providers
actions/                 Server Actions (logs, medications, wellness)
lib/
  db.ts                  Reusable cached Mongoose connection
  env.ts                 Type-safe env access
  time.ts                IST helpers (the app runs entirely on IST)
  data/                  Server-side query helpers per page
  seed.ts                Auto-seed medications if empty
models/                  Mongoose models (Medication, DailyLog, …)
hooks/                   useLiveClock, useToast
```

---

## 🚀 Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Create env files (database name is `health`)
cp .env.development.example .env.development
cp .env.production.example .env.production
# then set a real MONGODB_URI in each

# 3. Run the dev server (loads .env.development)
npm run dev
```

Use `npm run build` / `npm run start` for production (loads `.env.production`).
Never commit real credentials — only the `*.example` files.

Open <http://localhost:3000>. The four medications are inserted automatically on
first load if the collection is empty.

---

## 🍃 MongoDB Atlas setup

1. Create a free account at <https://www.mongodb.com/atlas> and a **free M0
   cluster**.
2. **Database Access** → *Add New Database User* → username + password (SCRAM).
3. **Network Access** → *Add IP Address* → **Allow access from anywhere**
   (`0.0.0.0/0`) so Vercel's serverless functions can connect.
4. **Connect → Drivers** → copy the connection string.
5. Set `MONGODB_URI` in `.env.development` / `.env.production` locally (see the
   `*.example` files; path must end with `/health`). On Vercel, add the same
   variable in Project Settings → Environment Variables. Collections and indexes
   are created automatically.

---

## ✅ How completion works

- Every enabled medication defines one or more IST schedule times. The app
  materialises a **`DailyLog` row per dose per day** (`date + medicationName +
  scheduledTime`).
- You mark a dose done from the **Today timeline**, the **dashboard** or a
  **medication card** — the toggle flips `completed` / `completedAt` on that
  dose's `DailyLog` row.
- Streaks, the heatmap and per-medication stats are all derived from those
  per-dose completion rows, which is what makes twice-daily medications work
  correctly.

---

## ▲ Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, **Add New → Project** and import the repo.
3. **Deploy.** Open your deployment — medications seed on first load.

---

## 🧰 Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server (`.env.development`).              |
| `npm run dev:prod`  | Dev server with production env.               |
| `npm run build`     | Production build (`.env.production`).         |
| `npm run build:dev` | Build with development env.                   |
| `npm run start`     | Run production build (`.env.production`).     |
| `npm run start:dev` | Run build with development env.               |
| `npm run typecheck` | Strict TypeScript check (`tsc --noEmit`).     |
| `npm run lint`      | ESLint.                                       |

---

## 🗃️ Data model

```ts
Medication { name, description, instructions, scheduleTimes[], intervalDays, enabled, timestamps }
DailyLog   { date, medicationName, scheduledTime, completed, completedAt, notes, count }
```

`DailyLog` tracks completion **per dose** (`date + medicationName +
scheduledTime`), which is what makes twice-daily medications, the timeline and
streaks all work correctly. `intervalDays` lets a medication recur every N days
(1 = daily, 2 = every other day).

The **wellness tracker** shares the same `dailylogs` collection: it stores one
row per day identified by the reserved `medicationName`/`scheduledTime` sentinel
`__wellness__`, using the `count` and `notes` fields. Every medication query
excludes that sentinel, so wellness never counts as a dose.

---

## 📝 Notes

- The entire app operates on **Asia/Kolkata (IST, UTC+05:30)** regardless of
  where the server runs — schedule times, "today" and streaks are all IST.
- shadcn/ui components live in `components/ui` and are yours to customise.
- The wellness tracker stores data only in your own database — it is completely
  private to your deployment.
```
