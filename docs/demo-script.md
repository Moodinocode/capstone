# Spotlight — Video Demo Script

> Target length: **15–18 minutes**. Tone: confident, slightly conversational.
> Audience: an algorithms instructor who is not a software engineer.
> Goal: show the platform end-to-end, then quickly drop into code at the moments
> that answer the predictable non-functional questions (security, scalability,
> reliability, maintainability, availability, efficiency).

---

## Pre-flight checklist (do once, the morning of recording)

- [ ] Pull latest, run `npm install` in both `client/` and `server/`.
- [ ] Apply Supabase migrations (`server/migrations/001…003.sql`) via the
      Supabase SQL editor.
- [ ] Reseed: `cd server && npm run seed`.
- [ ] Pre-generate AI insights for the 9 featured pitches:
      `node server/scripts/precacheInsights.js` (see Appendix A below — copy/paste
      that file before running).
- [ ] Pre-seed a couple of demo anomaly rows so `/admin/integrity` isn't empty:
      `node server/scripts/seedDemoFlags.js` (also in Appendix A).
- [ ] Open VS Code with these files pinned in tabs (in this order):
      1. `server/server.js`
      2. `server/middleware/validate.js`
      3. `server/middleware/limits.js`
      4. `server/utils/cache.js`
      5. `server/services/eventBus.js`
      6. `server/services/anomalyDetector.js`
      7. `server/services/claude.js`
      8. `server/controllers/voteController.js`
      9. `server/controllers/gradeController.js`
      10. `client/src/hooks/useEventStream.js`
- [ ] Two browsers: **Chrome** (logged in as `emilie@softskills` / admin) and
      **Firefox in private mode** (anonymous voter).
- [ ] Terminal 1: `cd server && npm run dev` (look for the pino-pretty logs).
- [ ] Terminal 2: `cd client && npm run dev`.
- [ ] Set `NODE_ENV=development` so logs are pretty-printed on screen.
- [ ] Set `REQUIRE_VOTE_TOKEN=true` for the demo so the two-step vote story is
      truthful.
- [ ] Mute Discord/Slack notifications, full-screen the browser.

---

## Act 0 — Opening (≤ 1 min)

> "This is **Spotlight**, a full-stack platform I built for the LAU Soft Skills
> 2026 event. It runs three things at the same time: live judge grading on a
> rubric, public attendee voting, and a real-time admin console that controls
> what the audience sees. I'll walk through each role, then we'll dive into the
> code that makes it scalable, secure, and reliable."

Show the home page in Chrome — the 3-D carousel, the live timeline strip, the
fan-vote leaderboard. Don't linger; tell them you're going to come back.

---

## Act 1 — Public voter flow (3 min)

1. **Firefox (incognito)** → home page. Note the carousel, the vote counts.
2. Click a featured pitch ("Giftr App"). Show the spotlight page.
3. Point at the **Quick Read** panel: *"That's an AI-generated summary plus
   apparent strengths — judges and the audience get the same reading aid."*
4. Click **Vote Now**. Confirmation modal → **Cast Vote**.
5. **Switch to the dev tools Network tab** and re-cast a vote on a different
   project. Show the **two requests**:
   - `POST /api/votes/init` returns a `voteToken`
   - `POST /api/votes` echoes that token
   *"Notice how the cast call has a token field. The server signs it with HMAC
   in `voteToken.js` — a `curl` loop that skips the init step gets a 403."*
6. Open `server/utils/voteToken.js` in VS Code and read the `verifyVoteToken`
   function out loud. **30 seconds.**

---

## Act 2 — Live admin push, real time (3 min)

1. Tile the two browser windows side-by-side.
2. In **Chrome (admin)**, navigate to the home page — same as Firefox.
3. Open dev tools in Firefox → Network → look for **"stream"** with type
   `eventsource`. *"That's a Server-Sent-Events connection. The browser holds
   the socket open, the server pushes."*
4. Show `server/services/eventBus.js` for 30 seconds. Highlight `broadcast()`
   and the `clients` `Set`.
5. Show `client/src/hooks/useEventStream.js` for 30 seconds. Highlight the
   reconnect watchdog. *"If Render drops the socket, this re-opens it within
   the staleness window. There's also a 60-second polling backstop in case SSE
   is blocked entirely."*
6. As admin, hit a private "session toggle" route via Postman or run
   `node scripts/toggleVotes.js` (see Appendix B). Watch the Firefox window
   update **without a refresh**.
7. Toggle `isPublic` to false → Firefox flips to "Coming Soon" instantly.
   Toggle back.

---

## Act 3 — Judge experience (3 min)

1. **Chrome**, navigate to `/#/judge/login`, log in with the seeded admin.
2. Dashboard: stat cards, progress bar, segmented assignment list.
3. Click **Evaluate** on Giftr App.
4. Open the **AI Insights** panel at the top:
   *"This calls Claude Haiku 4.5 with prompt caching. The system prompt is
   stable — every project re-uses the cached prefix and pays only ~10% of the
   input-token cost."*
5. Show `server/services/claude.js`, point at `cache_control: { type: 'ephemeral' }`.
6. Score the rubric (drag sliders to 5, 4, 5, 4, 5 = 23/25). Watch
   AutoSaveIndicator flicker.
7. Type into feedback. Show the auto-save fires.
8. Click **Submit Evaluation**.
9. Open the server terminal: point at the structured pino log line:
   `request.error` if anything failed, and the `grade.submit` audit row that
   was inserted.

---

## Act 4 — Admin analytics and integrity (3 min)

1. **Chrome admin**, navigate `/#/admin/analytics`.
2. Walk through the cards: total votes, unique voters, submitted grades.
3. The **votes-per-minute** sparkline. Trigger a few votes from Firefox → see
   it tick up live (cache TTL is 10 s for stats).
4. **Inter-rater reliability** table: *"This is the standard deviation of judge
   scores per project. High σ = controversial. The instructor doesn't need to
   know what σ is — just that we surface disagreement."*
5. Click **Integrity dashboard →**.
6. Show flagged votes + the audit trail.
7. Show `server/services/anomalyDetector.js` for 30 seconds.
   *"Every vote runs through this scorer. Burst from one IP, repeated UA,
   subnet flooding — all weighted. Anything `severity: high` (3+ on one
   project) is excluded from People's Choice."*

---

## Act 5 — Code interludes (2 min total, sprinkled)

Drop in 4 quick code reveals between acts when relevant:

| Window | When to show | What to say |
|--------|--------------|-------------|
| `server/server.js` | Start of Act 1 | "Two layers of rate limits: a 600 req/15 min global, and tighter per-route limits." |
| `server/middleware/validate.js` | When you click vote | "Every payload is validated by zod at the edge — invalid fields are rejected before any database call." |
| `server/utils/cache.js` | During Act 4 | "All hot reads go through this LRU. The dashboard's 75% hit rate means three out of four reads never touch the database." |
| `server/utils/audit.js` | Right after Act 3 | "Every privileged write — grade submit, session toggle — appends to `audit_logs`. That's how we'd answer 'did a judge alter their grade?'" |

---

## Act 6 — Winners reveal (1 min)

1. Navigate to `/#/winners`.
2. Show the podium animation.
3. Mention People's Choice. *"And this is the People's Choice — the honest one,
   computed only after excluding tainted projects from the integrity pass."*

---

## Act 7 — Wrap (1 min)

> "Stack: React 19 + Vite on Vercel, Express on Render, Supabase Postgres,
> Claude Haiku for AI insights, Server-Sent Events for real-time. The whole
> thing is stateless on the backend — Render can autoscale horizontally; the
> only shared state lives in Postgres and an LRU per process. Thanks for
> watching."

Hard cut.

---

## Appendix A — helper scripts to write before recording

### `server/scripts/precacheInsights.js`
```js
import 'dotenv/config';
import supabase from '../config/supabase.js';
import { generateInsights } from '../services/claude.js';

const FEATURED = ['P-103','P-104','P-107','P-108','P-116','P-117','P-121','P-123','P-124'];
const { data } = await supabase
  .from('projects').select('id, project_number, title, team_name, category, description, tags, segment_type')
  .in('project_number', FEATURED);
for (const p of data ?? []) {
  const ins = await generateInsights({
    title: p.title, teamName: p.team_name, category: p.category,
    description: p.description, tags: p.tags ?? [], segmentType: p.segment_type ?? 'project',
  });
  await supabase.from('ai_insights').upsert({
    project_id: p.id, model: process.env.ANTHROPIC_MODEL || 'stub',
    payload: ins, updated_at: new Date().toISOString(),
  }, { onConflict: 'project_id' });
  console.log('cached', p.project_number);
}
process.exit(0);
```

### `server/scripts/seedDemoFlags.js`
```js
import 'dotenv/config';
import supabase from '../config/supabase.js';

const { data: projects } = await supabase.from('projects')
  .select('id').eq('segment_type','project').limit(2);
const rows = (projects ?? []).map((p, i) => ({
  project_id: p.id,
  browser_token: '00000000-0000-0000-0000-00000000000' + i,
  ip: '203.0.113.' + (40 + i),
  score: 65 + i*5,
  severity: 'high',
  reasons: ['burst:5 from same IP within 60s', 'UA reused 7× in 5min'],
}));
await supabase.from('vote_flags').insert(rows);
console.log('seeded', rows.length, 'demo flags');
process.exit(0);
```

## Appendix B — talking-point soundbites to memorize

- *"Stateless backend — every request is independent."*
- *"LRU cache with 60-second TTL on read paths."*
- *"Helmet for HTTP security headers, bcrypt for password hashes, JWT for
   judges, HMAC for vote tokens — defense in depth."*
- *"Server-Sent Events with a watchdog reconnect — and a polling fallback so
   we degrade gracefully on flaky networks."*
- *"Append-only audit log keyed on judge id and timestamp, indexed for fast
   replay."*
- *"Anomaly detector with rule-based scoring; high-severity votes still count
   but are excluded from People's Choice."*
- *"Prompt caching on the Anthropic API call so the rubric system prompt is
   billed once and re-used across every insight call."*
