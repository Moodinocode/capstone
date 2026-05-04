# Spotlight Demo — Simple Spoken Script

> Plain-English version of `recording-plan.md`. Read it like a script.
> Each segment has: **what it's about** + **what to say** + **what to do**.

---

## Segment 0 — Cold open (45s)

**Focus:** The big picture. Tell the viewer what Spotlight is, what it does, who uses it.

**Show:** Public home page. The 3D carousel and live timeline.

**Say:**
> "Hi. This is Spotlight, the platform I built for the Soft Skills 2026 event.
> It does three things at once. The public audience can vote for their favourite
> projects. The judges can grade those projects on a rubric. And one event admin
> controls what everyone sees as the show plays out. I'll walk through each of
> those, and every time I show a feature I'll also show you the piece of code
> that makes it work."

---

## Segment 1 — Voting that can't be cheated

**Focus:** Anonymous voting that resists bots. Shows the two-step HMAC token.

**Show:**
1. Open a project on the public site.
2. Open DevTools (F12) → Network tab.
3. Click Vote Now → Cast Vote.
4. Point at the **two** requests that just fired.

**Say:**
> "In our voting feature we made sure there's no cheating. When you click
> Vote, look at the network tab — two requests fire, not one. The first asks
> the server for a permission slip; the server signs it with a secret key
> that only it knows. The second one is the actual vote, and it has to come
> back with that signed slip or the server rejects it. That means somebody
> who tries to write a script to vote a thousand times has to imitate both
> steps, with a fresh signed slip each time, and the slip expires after five
> minutes."

**Cut to code:** `server/utils/voteToken.js`. Point at the `issueVoteToken`
and `verifyVoteToken` functions.

> "The slip is just a hashed message: it carries the user's browser ID, the
> time it was issued, and a random number. The server checks all three before
> letting the vote through."

---

## Segment 2 — Vote spam protection

**Focus:** Rate limiting. Stops a user (or bot) from voting hundreds of times.

**Show:** Click Vote rapidly 6 times. The 6th request returns **429 — Too Many Requests**.

**Say:**
> "On top of that, every IP is capped at five votes per minute. Watch — I'll
> click vote six times in a row. See how the sixth one fails? That's a separate
> defence: even if somebody got past the signed slip, they'd hit this rate
> limit. We have three of these limits in the system: one for voting, one for
> logins, and one for grading. Each one watches a different kind of identity."

**Cut to code:** `server/middleware/limits.js`. Point at the three limiters.

---

## Segment 3 — Real-time push from admin to audience

**Focus:** Live updates without polling. The "magic" moment of the demo.

**Show:**
1. Two browser windows side-by-side: admin and public.
2. In admin → `/admin/analytics` → top "Live event controls" card.
3. Toggle **Event public** OFF.
4. Public window instantly shows "Coming Soon".
5. Toggle it back ON. Public unlocks.

**Say:**
> "Now watch this. On the left, the admin can flip a switch that hides the
> entire site behind a 'Coming Soon' page. On the right, an audience member
> is just looking at the home page. When I flip the switch... see that? The
> audience window updated instantly, no refresh. That's not polling — the
> browser keeps a connection open to the server, and when something changes
> the server pushes the update down. Less load on the database, faster
> updates for the user."

**Cut to code:** `server/services/eventBus.js`. Point at the `clients` set
and the `broadcast` function.

> "Every connected viewer is in this list on the server. When the admin
> changes anything, the server loops through the list and sends the update
> to all of them at once."

---

## Segment 4 — Catching suspicious votes

**Focus:** Anomaly detection. The "what if 10,000 bots vote?" answer.

**Show:** Admin → `/admin/integrity`. Shows seeded high-severity flags with
reasons like "burst:5 from same IP within 60s".

**Say:**
> "But what if a really determined cheater gets past the rate limit by using
> different IP addresses? Every vote gets scored on arrival. If too many votes
> come from the same IP, or the same internet block, or share a suspicious
> browser fingerprint, we flag the vote. Look at this dashboard — these are
> votes the system caught."

**Cut to code:** `server/services/anomalyDetector.js`.

> "We weight five signals. Three votes from the same IP in a minute? Forty
> points. Eight votes from the same neighbourhood subnet? Thirty more. Above
> sixty points and the vote is marked high severity."

**Say (without cutting):**
> "And if a single project gets three or more high-severity flags, it gets
> kicked out of the People's Choice winner — even though the votes still
> count in the total. So you can't win by gaming the audience vote."

---

## Segment 5 — Validating every input

**Focus:** Defensive coding at the API edge. The "what if someone sends garbage?" answer.

**Show:** In DevTools console, send a malformed login:
```js
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ email: 12345, password: null })
}).then(r => r.json()).then(console.log)
```

Server returns 400 with a list of issues.

**Say:**
> "Every request that hits the server gets checked first. If somebody sends
> a number where an email should be, or a missing password, the server
> rejects it before any database query runs. This is one extra layer of
> protection — the database never even sees a malformed request."

**Cut to code:** `server/middleware/validate.js`. Point at the `schemas` block.

---

## Segment 6 — AI-assisted reading aid for judges

**Focus:** The LLM feature. Show the panel, then show the smart caching.

**Show:**
1. Log in as a judge.
2. Click **Evaluate** on a project.
3. AI Insights panel renders at the top with a summary, three strengths,
   three questions a judge could ask, and rubric hints.

**Say:**
> "When a judge opens a project to grade, this panel appears at the top.
> It's powered by Claude — Anthropic's AI model. We send the project's
> description to the model with a long system prompt explaining our judging
> rubric, and the model gives back a quick summary, the project's apparent
> strengths, three questions a judge might ask, and hints for each rubric
> criterion. The judge always sets the actual score — this is just a
> reading aid."

**Cut to code:** `server/services/claude.js`. Point at the `cache_control` line.

> "The trick here: that long system prompt would normally cost the same on
> every API call. But Anthropic supports prompt caching — we mark the system
> prompt as 'cacheable' and they only charge full price for the first call
> in a five-minute window. Subsequent calls are 90% cheaper. So for nine
> featured projects, we pay full price once instead of nine times."

**Say (without cutting):**
> "And if the AI is unavailable for some reason, we fall back to a built-in
> stub that derives a summary from the project's description directly.
> The user never sees a blank panel."

---

## Segment 7 — Recording every action

**Focus:** Audit trail. The "what if a judge cheats?" answer.

**Show:**
1. Submit a grade as the judge from segment 6.
2. Switch to admin → `/admin/integrity` → scroll to Audit Trail.
3. Newest row: `grade.submit` with the judge's name and timestamp.

**Say:**
> "Every action a judge or admin takes leaves a permanent record. I just
> submitted a grade — look, here it is in the audit log. Who did it, what
> they did, when, from what IP. If a judge tried to change their grade
> after submitting, the system blocks it; and if they somehow worked
> around it, this log would still tell us. Submitted grades are read-only."

**Cut to code:** `server/utils/audit.js`. Point at the `audit` function.

---

## Segment 8 — Speed and resilience

**Focus:** Caching + health check. The "can it handle 10,000 users?" answer.

**Show:**
1. Admin → `/admin/analytics`. Show the Cache hit rate card (~70-80%).
2. Open a terminal, run `curl http://localhost:5001/api/health`.
3. The JSON response: db latency, uptime, memory, cache stats.

**Say:**
> "Every read on this site goes through a memory cache before it hits the
> database. The dashboard shows the cache is currently serving about
> 70 percent of requests without touching Postgres at all. So if 10,000 people
> showed up at once, the database wouldn't see anywhere near 10,000 queries.
> Just one query per filter combination per minute, and the rest comes from
> memory."

**Cut to code:** `server/utils/cache.js`. Point at `getOrSet` and `invalidate`.

> "And the health check tells us at any moment whether the database is up,
> how slow it is, and how much memory the server is using. That's how we'd
> know during a live event whether something was about to break."

---

## Segment 9 — Wrap up (30s)

**Focus:** Recap the stack and the engineering point.

**Show:** `/winners` page with the podium.

**Say:**
> "So that's Spotlight. React on the front, Express and Postgres on the back,
> Claude AI for the reading aid, server-sent events for real-time updates.
> The whole thing runs on free-tier hosting. The point of the architecture
> is that security, speed, and reliability aren't extras you bolt on at the
> end — they're a single line of code each, in the right place. Thanks for
> watching."

---

## Cheat sheet — feature → headline phrase

If the instructor asks a question mid-demo, here are one-line answers that
match what you've already shown:

| Question | One-line answer |
|---|---|
| "What if 10,000 users visit?" | "70% of reads come from cache, so the database sees a fraction of that. Plus the server itself is stateless, so we can run multiple copies." |
| "What if someone hacks the votes?" | "Five layers: signed token, IP rate limit, anomaly scoring, integrity dashboard, exclusion from the popular winner." |
| "What if a judge cheats their own score?" | "Every grade submit is logged with who, when, and what changed. And submitted grades are read-only — the system refuses to overwrite them." |
| "What if your AI breaks?" | "We have a built-in fallback that produces the same shape from the project description. The panel never blanks." |
| "What if the database goes down?" | "The health check reports it as 'degraded'. The cache keeps serving recent data. The frontend keeps rendering." |
| "Why React + Express + Postgres?" | "Boring tech where I could afford to be boring, so I had budget for the interesting parts: real-time push, AI integration, integrity layer." |

---

## Tone tips

- **Don't apologise on camera.** If something doesn't work, say "let me show
  you the next thing" and move on. We can edit out a stumble.
- **Don't read this script word-for-word.** Use it as a guide. Say what
  you remember, in your own voice.
- **Pause after a "wow" moment.** Let the public window flipping to "Coming
  Soon" register on the viewer for one full second before you keep talking.
- **Use the word "we" not "I"** when describing the system — it makes
  individual decisions sound considered, not lonely.
