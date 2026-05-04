# Spotlight Demo — Recording Plan

> Eight segments, each ~90–120 seconds. Total: ~14 minutes.
> Pattern per segment: **(1) show the feature live, (2) cut to the code that
> implements it, (3) point at the specific lines that do the work.**

## Pre-flight (do once before pressing record)

```powershell
cd C:\Users\m.mehdi\Desktop\capstone\server
npm run seed
node scripts/assignAdmin.js
node scripts/seedDemoFlags.js
node scripts/precacheInsights.js
npm run dev
```

Second terminal:
```powershell
cd C:\Users\m.mehdi\Desktop\capstone\client
npm run dev
```

VS Code: pin these tabs (left to right) so you can switch with one keystroke:
1. `server/middleware/limits.js`
2. `server/middleware/validate.js`
3. `server/utils/voteToken.js`
4. `server/services/eventBus.js`
5. `server/services/anomalyDetector.js`
6. `server/services/claude.js`
7. `server/utils/audit.js`
8. `server/utils/cache.js`

Two browser windows:
- **Edge** (admin): logged in as `admin@softskills` / `AdminSS25!`
- **Edge InPrivate** (public voter)

Resolution: 1920x1080. Show one window at a time fullscreen for clarity.

---

## Segment 0 — Cold open (45s)

**SHOW.** Public window at home page. Highlight: 3D carousel, fan vote leaderboard, live timeline.

**SAY.**
> "This is Spotlight, a real-time platform I built for the LAU Soft Skills 2026
> event. Three things happen on it at once: a public audience votes, a panel
> of judges grades on a rubric, and an event admin controls what the audience
> sees as the show progresses. I'll walk through each of those, pairing every
> feature with the code that implements it."

---

## Segment 1 — Anonymous voting with two-step HMAC token (security)

**SHOW.**
1. Public window → click any project → spotlight page.
2. **Open DevTools (F12) → Network tab.** Filter to `votes`.
3. Click **Vote Now** → modal → **Cast Vote**.
4. Point at the **two requests** that fired:
   - `POST /api/votes/init`  → 200 with `voteToken`
   - `POST /api/votes`        → 201

**SWITCH TO CODE.** Open `server/utils/voteToken.js`.

**POINT AT lines 15–23** (the `issueVoteToken` function).
**SAY.**
> "When you click Vote, the browser first hits `/votes/init`. The server signs a
> short-lived HMAC token bound to the user's browser token, plus a timestamp
> and a nonce. That token has to come back on the actual vote, or the vote is
> rejected. This means a curl loop that skips the init step gets a 403."

**POINT AT lines 25–46** (the `verifyVoteToken` function).
**SAY.**
> "Verification uses `timingSafeEqual` so a determined attacker can't time the
> bytes of the signature. And the token expires after five minutes."

---

## Segment 2 — Per-route rate limiting (security continued)

**SHOW.** In Network tab, click the vote button rapidly 6 times. The 6th fails with **429**.

**SWITCH TO CODE.** Open `server/middleware/limits.js`.

**POINT AT lines 12–19** (`voteLimiter`).
**SAY.**
> "This is per-IP, five votes per minute. A separate limiter on `/auth/login`
> defends against credential stuffing; another keyed on the judge ID protects
> grading endpoints. Three layers, each scoped to the right identity."

---

## Segment 3 — Server-Sent Events: live admin push (scalability + real-time)

**SHOW.**
1. Tile Edge (admin) and Edge InPrivate (public) side-by-side.
2. In **public** window's DevTools → Network → filter for `stream`. Show the
   long-lived `/api/session/stream` connection sitting open.
3. In **admin** window: navigate `/admin/analytics`. At the top there's the
   **Live event controls** card.
4. Toggle **Event public** OFF.
5. **The public window flips to "Coming Soon" instantly.**
6. Toggle it back ON. Public unlocks.

**SWITCH TO CODE.** Open `server/services/eventBus.js`.

**POINT AT lines 12–22** (`addClient`, `broadcast`).
**SAY.**
> "Every connected browser is in this in-memory Set. When the admin flips a
> toggle, the controller calls `broadcast` with a JSON event. The server pushes
> to every member of the set in one synchronous loop. There's no polling — the
> browser holds the connection open."

**POINT AT lines 35–40** (the heartbeat).
**SAY.**
> "Render's free tier kills idle sockets after 60 seconds, so we send a comment
> ping every 25 seconds to keep them alive. And the client has a watchdog
> that reconnects if a connection ever does drop."

---

## Segment 4 — Vote anomaly detection (integrity)

**SHOW.**
1. Admin window → `/admin/integrity`.
2. Two **high-severity** flags are visible (seeded by `seedDemoFlags.js`).
3. Hover the reasons column: "burst:5 from same IP within 60s", "UA reused 7×".

**SWITCH TO CODE.** Open `server/services/anomalyDetector.js`.

**POINT AT lines 40–60** (the scoring rules).
**SAY.**
> "Every vote runs through this scorer on arrival. We weight five signals: bursts
> from the same IP, bursts from the same /24 subnet, UA reuse, IP density over
> five minutes, and missing User-Agents. Score above 60 marks the vote as high
> severity."

**SWITCH TO CODE.** Open `server/controllers/winnersController.js`.

**POINT AT the `getTaintedProjectIds` function (~line 80).**
**SAY.**
> "Three or more high-severity flags on the same project, and that project gets
> excluded from the People's Choice tally. The vote still counts in the total,
> but it can't decide the popular winner. This is the integrity ceiling for an
> anonymous-voting system that doesn't want CAPTCHAs."

---

## Segment 5 — Schema validation at the edge (security continued)

**SHOW.** In DevTools console, paste:
```js
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ email: 12345, password: null }),
}).then(r => r.json()).then(console.log)
```

The response: 400 with a list of zod issues like `{ path: 'email', message: 'Invalid input' }`.

**SWITCH TO CODE.** Open `server/middleware/validate.js`.

**POINT AT lines 26–60** (the `schemas` block).
**SAY.**
> "Every payload that hits an endpoint is validated by zod before any database
> call happens. Invalid types, wrong UUIDs, scores out of range — all rejected
> at the edge with structured 400 errors. This is the cheapest layer of defence
> and it kills an entire class of injection bugs before they start."

---

## Segment 6 — Judge grading + AI Insights with prompt caching (LLM feature)

**SHOW.**
1. Log out, log in as `emilie@softskills` / `Emilie@SS25` (or use admin since admin can grade now).
2. Click **Evaluate** on a featured pitch.
3. **The AI Insights panel renders instantly** at the top of the page.
   Expand it: summary, three apparent strengths, three questions to ask, rubric hints.
4. Drag the rubric sliders. Watch **AutoSaveIndicator** flicker "Saving..." → "Saved".
5. Click **Submit Evaluation**.

**SWITCH TO CODE.** Open `server/services/claude.js`.

**POINT AT the system prompt declaration (lines 12–35) and the `messages.create` call (~line 60).**
**SAY.**
> "The rubric system prompt is declared with `cache_control: ephemeral`. That
> means the first call to Claude pays full price for the rubric, and every
> subsequent call within five minutes pays ten percent of that. For nine
> featured pitches we pay for one full rubric send, then eight cheap ones."

**POINT AT the `stubInsights` function near the bottom.**
**SAY.**
> "If the API key is unset or the call fails, this stub returns the same
> JSON shape, derived from the project description. The UI doesn't know the
> difference. That's graceful degradation — the panel never blanks."

---

## Segment 7 — Audit log + immutable grades (reliability + security)

**SHOW.**
1. After segment 6, open `/admin/integrity` again. Scroll to **Audit trail**.
2. The most recent row: `grade.submit` by Emilie, with timestamp and target.
3. Try to navigate back to the same project's grading page. The rubric is
   read-only ("Submitted" badge).

**SWITCH TO CODE.** Open `server/utils/audit.js`.

**POINT AT lines 16–32** (the `audit` function).
**SAY.**
> "Every privileged write — grade submit, session toggle, public flip — appends
> a row here. Actor, action, target, before/after metadata, IP, timestamp. If
> a judge tried to alter their grade after submitting, this log would catch it
> on the next replay. And the grade controller refuses any write to a row whose
> status is already `submitted`."

---

## Segment 8 — LRU cache + health probe (efficiency + availability)

**SHOW.**
1. Admin window → `/admin/analytics`. Highlight the **Cache hit rate** card —
   should show ~70–80% after a minute of normal traffic.
2. In a terminal, run `curl http://localhost:5001/api/health` and read the
   output: `db.latencyMs`, `cache.hitRate`, `sseClients`, `memory.heapUsedMb`.

**SWITCH TO CODE.** Open `server/utils/cache.js`.

**POINT AT lines 10–30** (`getOrSet` and `invalidate`).
**SAY.**
> "Every read endpoint wraps its database call in `getOrSet`. The project list
> caches for 60 seconds, vote counts for 5, winners for 30. When a vote or
> grade arrives, the controller calls `invalidate` on the affected key prefix.
> So at 10,000 simultaneous visitors, the database sees one query per
> filter combination per minute — not 10,000."

**POINT AT health-check route in `server/server.js` (~line 50).**
**SAY.**
> "The health check pings the DB on every call and returns `degraded` instead
> of 500 when Supabase is unreachable. So Render's health monitor doesn't flap,
> and a monitoring dashboard can still distinguish 'API up, DB slow' from
> 'API down'."

---

## Segment 9 — Closing (30s)

**SHOW.** `/winners` page with the podium animation.

**SAY.**
> "Stack: React 19 on Vercel, Express on Render, Supabase Postgres, Claude
> Haiku for AI insights, Server-Sent Events for real-time. The whole thing
> runs on free-tier infrastructure. The point of the architecture is that
> security, scalability, reliability, maintainability, availability, and
> efficiency aren't separate concerns — they're each a single line of code in
> the right place at the controller boundary. Thanks for watching."

Hard cut.

---

## What you do *not* show

- The terminal logs (they look intimidating to a non-coder).
- The package.json files (boring).
- Migrations SQL (covered in the report).
- Full lstlistings in VS Code beyond the relevant 5–10 lines.

## When something doesn't work on camera

- **AI panel slow.** You pre-warmed it. If it's still slow, click anyway and say
  "first call is uncached; this would be cached for the next attendee."
- **Vote rate-limit fires too early.** Wait 60s before voting again, or restart server.
- **SSE doesn't push fast.** Hard-refresh the public window to reconnect; the
  watchdog reconnect proves the resilience point.
- **Anything else.** Pivot — never apologise on camera. Move to the next segment.
