import supabase from '../config/supabase.js';
import { issueVoteToken, verifyVoteToken, hashUserAgent } from '../utils/voteToken.js';
import { scoreVote, recordFlag } from '../services/anomalyDetector.js';
import { broadcast } from '../services/eventBus.js';
import { cache } from '../utils/cache.js';
import logger from '../utils/logger.js';

/**
 * POST /api/votes/init
 * First leg of a two-step vote. Issues a short-lived HMAC token bound to the
 * client's browserToken. The client must echo it back on /api/votes — making
 * a curl loop that skips this round-trip cheap to detect.
 */
export const initVote = async (req, res) => {
  const { browserToken } = req.body;
  const voteToken = issueVoteToken(browserToken);
  res.json({ voteToken, ttlSec: 300 });
};

/**
 * POST /api/votes
 * Cast a vote. Defends in depth:
 *   1. zod validation (route-level)
 *   2. per-IP rate limit (route-level)
 *   3. signed-token check that proves the client passed through /init
 *   4. duplicate check on browser_token (same browser → 1 vote)
 *   5. anomaly score; high severity → flag persisted
 */
export const castVote = async (req, res) => {
  const { projectId, browserToken, voteToken } = req.body;
  const ip = req.ip ?? '';
  const userAgent = req.headers['user-agent'] || '';

  // 3. token check (only enforced when REQUIRE_VOTE_TOKEN is set —
  //    leaves room for a one-off public link without breaking the demo).
  if (process.env.REQUIRE_VOTE_TOKEN === 'true') {
    const v = verifyVoteToken(voteToken, browserToken);
    if (!v.ok) return res.status(403).json({ message: `Vote token invalid: ${v.reason}` });
  }

  // 4. project + duplicate check
  const { data: project } = await supabase
    .from('projects').select('id').eq('id', projectId).single();
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const { data: existing } = await supabase
    .from('votes').select('project_id').eq('browser_token', browserToken).maybeSingle();
  if (existing) {
    return res.status(409).json({
      message: 'Already voted',
      votedProjectId: existing.project_id,
    });
  }

  // 5. anomaly scoring (in-memory; cheap)
  const anomaly = scoreVote({ ip, userAgent, browserToken });

  // Insert the vote first — even flagged ones are recorded.
  const { data: insertedVote, error: insertErr } = await supabase
    .from('votes')
    .insert({
      project_id: projectId,
      browser_token: browserToken,
      ip_address: ip,
    })
    .select()
    .single();

  if (insertErr) {
    logger.error({ err: insertErr.message }, 'vote insert failed');
    return res.status(500).json({ message: 'Could not record vote' });
  }

  // RPC keeps vote_count atomic against concurrent writers.
  await supabase.rpc('increment_vote_count', { p_id: projectId });

  // Persist the flag (best effort; non-blocking).
  if (anomaly.severity !== 'none') {
    recordFlag({
      voteId: insertedVote.id,
      projectId,
      browserToken,
      ip,
      userAgent: hashUserAgent(userAgent),
      score: anomaly.score,
      severity: anomaly.severity,
      reasons: anomaly.reasons,
    }).catch((e) => logger.warn({ err: e.message }, 'flag persist failed'));
  }

  // Hot reads (project list, winners, vote counts) just changed.
  cache.invalidate('projects:');
  cache.invalidate('winners:');
  cache.invalidate('vote-counts');

  // Push the new tally to every connected SSE client.
  broadcast('vote.cast', {
    projectId,
    flagged: anomaly.severity !== 'none',
    severity: anomaly.severity,
  });

  res.status(201).json({
    message: 'Vote recorded',
    projectId,
    flagged: anomaly.severity !== 'none',
  });
};

export const checkVote = async (req, res) => {
  const { data } = await supabase
    .from('votes').select('project_id').eq('browser_token', req.params.token).maybeSingle();
  if (!data) return res.json({ voted: false, projectId: null });
  res.json({ voted: true, projectId: data.project_id });
};

export const getVoteCounts = async (_req, res) => {
  const data = await cache.getOrSet('vote-counts', 5_000, async () => {
    const { data } = await supabase
      .from('projects')
      .select('id, title, vote_count')
      .order('vote_count', { ascending: false });
    return (data ?? []).map((p) => ({ projectId: p.id, title: p.title, count: p.vote_count }));
  });
  res.json(data);
};
