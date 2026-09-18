# Spotlight

An event platform built for the **LAU Soft Skills Event 2026** and used to run it live: judges graded projects from their phones, the audience voted, and the organisers watched results and integrity checks update in real time.

Capstone project. The full write-up is in [`report/main.pdf`](report/main.pdf).

## What it does

The event ran four kinds of segment — startup pitches, TED-style talks, mock interviews, and a project expo — each needing to be presented, judged, and voted on in sequence, on a schedule, in front of an audience.

**For the audience**
- Browse the project gallery and read team profiles
- Vote for favourites, with the running tally deliberately hidden during the event
- A spotlight page for whichever project is presenting, with a large stopwatch drawn as an SVG progress ring so the room can see time remaining
- Winners announced at the end

**For judges**
- Sign in and see only the projects assigned to them
- Grade against a rubric, with the project's poster and talk video in the sidebar while scoring
- Progress tracked across their assigned segments

**For organisers**
- Drive the live session: advance the current segment, control what the audience sees
- Lock the public site behind a "coming soon" screen until the event starts, without affecting the judge portal
- **Analytics dashboard** — grading progress, score distributions, participation
- **Integrity dashboard** — every vote is scored for anomalies, and suspicious ones are flagged for review
- **AI insights** — generated summaries over the results, backed by Claude, with a deterministic stub so the feature works without an API key

## Architecture

```
client/   React + Vite            →   Vercel
    │
    │  REST over HTTPS
    ▼
server/   Node + Express          →   Render
    │
    ▼
Supabase (PostgreSQL)
```

**Client** — React with React Router, Recharts for the dashboards, axios for the API.
Pages: Home, ProjectGallery, ProjectSpotlight, VotingPage, Winners, plus `admin/` (Analytics, Integrity) and `judge/` (Login, Dashboard, Grading).

**Server** — Express with a controller-per-resource layout:

| Route | Purpose |
|---|---|
| `authRoutes` | Judge and admin login, JWT issuance |
| `projectRoutes` | Projects, teams, media |
| `gradeRoutes` | Rubric scoring, per-judge assignments |
| `voteRoutes` | Public voting, token issuance, anomaly scoring |
| `sessionRoutes` | Live session state — what is on screen now |
| `scheduleRoutes` | Event programme and timings |
| `winnersRoutes` | Final results |
| `adminRoutes` | Analytics and flagged-vote review |
| `aiRoutes` | Generated insights, plus a health check |

## Things worth pointing out

**Vote integrity.** Voting is open to the public, so it is the obvious thing to abuse at a live event. Votes optionally require a server-issued HMAC token from `/api/votes/init` (`REQUIRE_VOTE_TOKEN`), and every vote is scored by an anomaly detector whose high-severity results are persisted as flags for the integrity dashboard. The scoring is in-memory and cheap, so it adds no meaningful latency to a vote.

**The AI feature degrades gracefully.** With no `ANTHROPIC_API_KEY` set, insights fall back to a deterministic stub rather than erroring, so the platform still demos and runs without the key.

**Operational hardening**, because this had to survive a real audience rather than a demo:

- `helmet` for security headers, `express-rate-limit` on public endpoints
- `zod` schemas via validation middleware on incoming payloads
- `bcryptjs` password hashing, JWT auth with configurable expiry
- `pino` structured logging with request logging
- `lru-cache` on hot read paths
- A central error handler

## Running it

### Prerequisites
- Node.js 18+
- A Supabase project (PostgreSQL)

### Server

```bash
cd server
npm install
cp .env.example .env     # fill in Supabase URL/key and JWT_SECRET
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

### Seeding

```bash
cd server
node seed/seed.js
```

The seed creates five judge accounts and one admin. **Their passwords come from the environment** — `JUDGE_1_PASSWORD` through `JUDGE_5_PASSWORD` and `ADMIN_PASSWORD` — and fall back to obvious local-development values if unset. Set real values before seeding anything reachable from outside your machine.

The judges who served at the real event are not named in this repository.

## Documentation

| Document | Contents |
|---|---|
| [`report/main.pdf`](report/main.pdf) | Full capstone report — requirements, architecture, data model, detailed design, testing, deployment, future work |
| [`report/main.tex`](report/main.tex) | LaTeX source, split by section under `report/sections/` |
| `product_requirements_document.html` | Original PRD |
| [`docs/runbook.md`](docs/runbook.md) | Operating the platform — setup and running the event |
