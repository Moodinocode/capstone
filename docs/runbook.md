# Runbook — operating the Spotlight platform

## One-time setup on a fresh machine

1. Install Node 20+, npm.
2. `git clone …` the repo.
3. `cd server && npm install`
4. `cp .env.example .env` and fill in:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (Supabase project settings).
   - `JWT_SECRET` — `openssl rand -hex 32` or any long random string.
   - Optional: `ANTHROPIC_API_KEY` to enable real Claude calls.
5. Apply migrations to Supabase. Open SQL editor in Supabase and run, in order:
   - `migrations/001_audit_logs.sql`
   - `migrations/002_vote_flags.sql`
   - `migrations/003_ai_insights.sql`
6. `npm run seed` — populates projects, judges, schedule, and an empty live
   session.
7. `cd ../client && npm install`
8. `npm run dev` — Vite serves on http://localhost:5173.
9. In another terminal: `cd ../server && npm run dev` — listens on 5001.

## Going live

- Set `NODE_ENV=production` and `LOG_LEVEL=info` on Render.
- Set `REQUIRE_VOTE_TOKEN=true` to enforce the two-step vote flow.
- Set `VITE_USE_SSE=true` on Vercel.
- The first admin must log in via `/judge/login` then visit `/admin/analytics`.
- To open the doors: log in as admin → call `POST /api/session/set-public`
  with `{ "public": true }` (or use the curl in `scripts/`).

## During the event

- **Watch:** `/admin/analytics` for vote velocity & cache hit rate.
- **Watch:** `/admin/integrity` for high-severity flags.
- If a project is unfairly tainted (3+ high-severity flags from a real
  organic burst), an admin can `delete from vote_flags where project_id = ?`
  via Supabase — this immediately re-includes the project in People's Choice.

## After the event

- Toggle `voteCountVisible` to false if you want to keep counts private.
- Toggle `isPublic` to false to put the site back into "Coming Soon" mode.
- Export the audit trail: SQL editor → `select * from audit_logs order by created_at`.
