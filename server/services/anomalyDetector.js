import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

// Lightweight in-memory ring of recent votes for fast scoring.
// We still reach into Supabase for /24-subnet density so flags survive restart.
const recent = []; // { ip, ua, time, browserToken }
const RECENT_WINDOW_MS = 5 * 60 * 1000;
const BURST_WINDOW_MS  = 60 * 1000;

function trim() {
  const cutoff = Date.now() - RECENT_WINDOW_MS;
  while (recent.length && recent[0].time < cutoff) recent.shift();
}

function subnet24(ip) {
  if (!ip) return '';
  // strip IPv6 v4-mapped prefix, then take first 3 octets
  const v4 = ip.replace(/^::ffff:/, '');
  const parts = v4.split('.');
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.0/24` : v4;
}

/**
 * Score a vote attempt. Returns { score, severity, reasons[] }.
 *   score 0–100
 *   severity 'none' | 'low' | 'medium' | 'high'
 *   reasons human-readable
 */
export function scoreVote({ ip, userAgent, browserToken }) {
  trim();
  const reasons = [];
  let score = 0;
  const now = Date.now();
  const subnet = subnet24(ip);

  const sameIp = recent.filter((r) => r.ip === ip);
  const sameSubnet = recent.filter((r) => subnet24(r.ip) === subnet);
  const sameUa = recent.filter((r) => r.ua === userAgent);
  const burstIp = sameIp.filter((r) => now - r.time < BURST_WINDOW_MS);
  const burstSubnet = sameSubnet.filter((r) => now - r.time < BURST_WINDOW_MS);

  if (burstIp.length >= 3)        { score += 40; reasons.push(`burst:${burstIp.length} from same IP within 60s`); }
  else if (burstIp.length >= 1)   { score += 15; reasons.push(`recent vote from same IP within 60s`); }
  if (burstSubnet.length >= 8)    { score += 30; reasons.push(`burst:${burstSubnet.length} from /24 within 60s`); }
  if (sameUa.length >= 6)         { score += 15; reasons.push(`UA reused ${sameUa.length}× in 5min`); }
  if (sameIp.length >= 12)        { score += 20; reasons.push(`${sameIp.length} votes from same IP in 5min`); }
  if (!userAgent || userAgent.length < 10) { score += 10; reasons.push('thin/missing User-Agent'); }

  let severity = 'none';
  if (score >= 60) severity = 'high';
  else if (score >= 30) severity = 'medium';
  else if (score >= 10) severity = 'low';

  recent.push({ ip, ua: userAgent, time: now, browserToken });
  return { score, severity, reasons };
}

/**
 * Persist a flag (best-effort). Returns inserted row or null.
 */
export async function recordFlag({ voteId, projectId, browserToken, ip, userAgent, score, severity, reasons }) {
  if (severity === 'none') return null;
  try {
    const { data, error } = await supabase
      .from('vote_flags')
      .insert({
        vote_id: voteId ?? null,
        project_id: projectId,
        browser_token: browserToken,
        ip,
        user_agent_hash: userAgent ? userAgent.slice(0, 200) : null,
        score,
        severity,
        reasons,
      })
      .select()
      .single();
    if (error) logger.warn({ err: error.message }, 'vote_flag insert failed');
    return data;
  } catch (err) {
    logger.warn({ err: err.message }, 'vote_flag insert threw');
    return null;
  }
}

// Exposed for tests / admin maintenance.
export function _resetRecent() { recent.length = 0; }
