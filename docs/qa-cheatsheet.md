# Instructor Q&A Cheat Sheet

The instructor doesn't read code; they probe with broad non-functional
questions. Each row below has:

1. The probe (paraphrased — they may say it differently).
2. A **headline answer** under 25 words.
3. A **second sentence** with a concrete artifact you can show on screen.
4. The **file & rough line** to navigate to.

> Tip: never say "we don't have that." Pivot to the closest thing you do have.

---

## SECURITY

### "What if a student tries to hack the grading?"
**Headline:** Every grade write is JWT-authenticated, role-checked, schema-validated, and appended to an immutable `audit_logs` table — we'd see exactly who, when, and what changed.
**Show:** `server/utils/audit.js` and the audit trail in `/admin/integrity`.

### "What if someone votes 1,000 times?"
**Headline:** Three layers stop them: a 5-vote-per-minute IP rate limit, a server-issued HMAC vote token that proves the client passed the page once, and an anomaly scorer that flags bursts and excludes them from People's Choice.
**Show:** `server/middleware/limits.js` (voteLimiter) and `server/services/anomalyDetector.js`.

### "What if someone steals a judge's password?"
**Headline:** Passwords are bcrypt-hashed in the DB; the JWT is short-lived and signed; on suspicious activity admins can wipe sessions by rotating `JWT_SECRET`.
**Show:** `server/seed/seed.js` line where `bcrypt.hash` is called, then `authController.js`'s `bcrypt.compare`.

### "Is the data safe from SQL injection?"
**Headline:** All queries go through Supabase's parameterized client — no string concatenation, no raw SQL.
**Show:** `server/controllers/voteController.js` `.eq('browser_token', browserToken)` — point out it's an API call, not a string.

### "What about XSS?"
**Headline:** Helmet sets a strict Content-Security-Policy by default, and React escapes everything by default unless you explicitly use `dangerouslySetInnerHTML` (we never do).
**Show:** `server/server.js` `app.use(helmet())`.

### "What if your API key leaks?"
**Headline:** Secrets live in `.env` files that are git-ignored; the `.env.example` shows variable names but never values; on Render they're set via the dashboard.
**Show:** `.gitignore` then `server/.env.example`.

---

## SCALABILITY

### "What if 10,000 users visit?"
**Headline:** The frontend is static and served from Vercel's CDN — that's free at scale. The backend is stateless Express that reads from an LRU cache; only writes hit the database.
**Show:** `server/utils/cache.js` and `server/server.js` showing how every read controller wraps its DB call in `cache.getOrSet`.

### "What about the database under load?"
**Headline:** Supabase Postgres with PgBouncer in front. Vote increments use a Postgres RPC function so they're atomic under concurrency, not read-modify-write from Node.
**Show:** `server/controllers/voteController.js` calling `supabase.rpc('increment_vote_count', …)`.

### "Can you handle a vote burst?"
**Headline:** Yes. The hot path inserts one row, calls one RPC, and broadcasts to SSE clients in memory — sub-10ms work. The cache invalidation is bounded.
**Show:** `castVote` in `voteController.js` — count the I/O calls.

### "Why not WebSockets?"
**Headline:** SSE is one-way push, which is exactly what we need; it works through corporate proxies that often block WebSockets, and the browser handles reconnection natively.
**Show:** `client/src/hooks/useEventStream.js`.

### "What if Vercel goes down?"
**Headline:** The frontend is just static HTML+JS+CSS — we could mirror it to S3 or Netlify in 5 minutes. Backend on Render is autoscaled across multiple regions.
**Show:** `client/dist/` after a `npm run build`.

---

## RELIABILITY

### "What if the database query fails?"
**Headline:** Every async controller is wrapped in `asyncHandler` so errors flow to a global error handler that logs the request id and returns a clean JSON error to the client. The frontend has loading and error states.
**Show:** `server/utils/asyncHandler.js` and `server/middleware/errorHandler.js`.

### "What if your server crashes mid-event?"
**Headline:** The backend is stateless. Render auto-restarts in seconds. SSE clients reconnect automatically. The frontend keeps rendering whatever was last fetched, and our 60-second polling backstop catches anything missed during the gap.
**Show:** `client/src/hooks/useEventStream.js` reconnect watchdog.

### "Have you tested it?"
**Headline:** Manually, end-to-end — vote dedup, grade lock-after-submit, anomaly thresholds, SSE reconnect after network change. The architecture makes it easy to add unit tests if a CI pipeline is required next semester.
**Show:** `docs/demo-script.md` pre-flight checklist (it's effectively a smoke-test plan).

### "How would you debug a problem in production?"
**Headline:** Pino structured logs include a request id on every line; we'd correlate by id, look up audit-log rows for the same actor, and replay.
**Show:** `server/utils/logger.js` and the request id in any log line.

---

## MAINTAINABILITY

### "Why did you choose this stack?"
**Headline:** React + Express + Supabase: same language top to bottom, small footprint, deploys for free, generates production-grade SQL out of the box. We picked boring tech where we could so we could spend complexity budget on the AI features and the integrity layer.
**Show:** the folder tree.

### "How would another developer onboard?"
**Headline:** Two `npm install` commands, one `.env.example` to copy, one seed script. Routes are one folder, controllers are another, business logic is in services — there's a clean place for every kind of change.
**Show:** `server/` directory structure.

### "Why no TypeScript?"
**Headline:** A judgement call — we wanted iteration speed for the rubric and AI features. Every public payload has a zod schema in `validate.js`, which gives us runtime validation that's stronger than TypeScript's compile-time check.
**Show:** `server/middleware/validate.js`.

---

## AVAILABILITY

### "What if the AI API is down?"
**Headline:** The `claude.js` service falls back to a deterministic stub built from the project description — same response shape, no API call. The UI is unaware of the difference.
**Show:** `server/services/claude.js` `stubInsights` function.

### "What if Supabase goes down?"
**Headline:** `/api/health` returns `degraded` immediately, the LRU cache continues to serve recent reads, and writes fail loudly with retry-able 500s instead of silently corrupting state.
**Show:** `server/server.js` health check, mention it pings the DB on every call.

### "What about graceful degradation?"
**Headline:** Three things: SSE has a polling fallback, the AI panel has a stub, and the React app renders skeleton states for every loading panel so a slow backend doesn't show a blank screen.
**Show:** any page's loading skeleton.

---

## EFFICIENCY

### "Are you optimized?"
**Headline:** The hot read paths are cached for 30–60 seconds — the dashboard shows real-time hit rate. The hot write paths do exactly one DB insert, one atomic counter, and one in-memory broadcast.
**Show:** `/admin/analytics` cache hit-rate card.

### "Why not Redis?"
**Headline:** Process-local LRU is enough at this scale. Adding Redis would be over-engineering — but the cache module is one file, so swapping in Redis is a 50-line change if we ever need to share cache across instances.
**Show:** `server/utils/cache.js`.

### "Could it be faster?"
**Headline:** The lowest-hanging optimization left is route-level code-splitting on the React side, which would cut the initial bundle from 740 kB to maybe 250 kB. We left that for next iteration.
**Show:** the `npm run build` output line.

---

## "Gotcha" probes — be ready

### "What's the worst-case scenario?"
Pause briefly, then: *"Probably a coordinated bot vote-stuffing attack. We have rate limits, the anomaly detector, the People's Choice exclusion, and the audit log — but a determined attacker with a botnet could still skew numbers. The mitigation we'd add next is a CAPTCHA on the `/vote/init` step."*

### "What's something you'd do differently?"
*"I'd write integration tests up front. The architecture is set up for them — every controller is pure-ish — but we ran out of time before the event."*

### "What's the most interesting bug you fixed?"
*"The first version polled the session every 30 seconds. The home page leaderboard felt laggy. I switched to SSE and added a watchdog reconnect — that's `useEventStream.js`. The page now updates within 100 ms of an admin click."*

### "How did you handle disagreement on this project?"
(If solo: don't lie.) *"Solo project — but I tried to argue with myself by writing decision records for the big calls: SSE vs WebSockets, JWT vs sessions, LRU vs Redis. They're in the report's Architecture section."*
