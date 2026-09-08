# AttendX — Smart Attendance Dashboard

A fast, offline-friendly attendance tracker built with **React + Vite + Tailwind CSS**.
Add your subjects, mark each class present / absent / cancelled, and AttendX tells
you exactly how many classes you must attend to hit your target — or how many you
can safely skip.

All data is stored **locally in your browser** (`localStorage`). Nothing is sent
to a server. Use **Settings → Export** to back up or move to another device.

## Features

- **Per-subject & global attendance targets** (default 75%, fully adjustable)
- **Mark today** in one tap, or backfill past days from the **Today** tab
- **Dated history** per subject — edit or delete any past mark
- **Cancelled classes** that don't count against you
- **Weekly timetable** driving a per-day "what do I have today" checklist
- **Stats**: overall %, subject-wise breakdown, cumulative trend, safe-bunk total
- **End-of-term projections** (set an expected class count)
- **Light / dark / system theme**
- **Backups**: JSON export/import + automatic local snapshots you can restore
- **Installable PWA** — works offline, add to home screen

## Tech Stack

- **Frontend:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Type:** Bricolage Grotesque · Plus Jakarta Sans
- **Language:** JavaScript

## Data safety

The storage layer is versioned and migrates older formats forward automatically:

| Version | Shape |
| ------- | ----- |
| v1 | bare array `[{ id, name, attended, total }]` |
| v2 | `{ version, settings, subjects }` |
| v3 | subjects gain colour, emoji, custom target, expected total, schedule, dated log |

Before any migration or import, the previous data is copied into a local snapshot
(Settings → Automatic snapshots).

## Development

```bash
git clone https://github.com/DevanshSharma351/AttendX.git
cd AttendX

npm install
npm run dev      # start Vite dev server
npm run build    # production build to dist/
npm run preview  # preview the production build (service worker active here)
npm run lint
```

## Deployment

Deploys as a static site (Vercel `vite` preset). `vercel.json` adds an SPA
rewrite and keeps `sw.js` uncached so updates ship immediately.
