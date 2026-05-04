import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

const SECRET = process.env.VOTE_TOKEN_SECRET || process.env.JWT_SECRET || 'dev-only-vote-secret';
const TTL_MS = 5 * 60 * 1000; // a vote-intent token is valid for 5 minutes

// Format: base64(payload).hmac  where payload = `${browserToken}|${issuedAt}|${nonce}`
function sign(payload) {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

export function issueVoteToken(browserToken) {
  const issuedAt = Date.now();
  const nonce = randomBytes(8).toString('hex');
  const payload = `${browserToken}|${issuedAt}|${nonce}`;
  const sig = sign(payload);
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifyVoteToken(token, expectedBrowserToken) {
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, reason: 'malformed' };
  const [b64, sig] = token.split('.');
  let payload;
  try {
    payload = Buffer.from(b64, 'base64url').toString('utf8');
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  const expectedSig = sign(payload);
  if (sig.length !== expectedSig.length) return { ok: false, reason: 'bad-signature' };
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return { ok: false, reason: 'bad-signature' };
  }
  const [browserToken, issuedAtStr] = payload.split('|');
  if (browserToken !== expectedBrowserToken) return { ok: false, reason: 'token-mismatch' };
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return { ok: false, reason: 'malformed' };
  if (Date.now() - issuedAt > TTL_MS) return { ok: false, reason: 'expired' };
  return { ok: true };
}

// SHA-1 of UA — narrow, irreversible, just enough to detect ham-fisted reuse.
import { createHash } from 'crypto';
export function hashUserAgent(ua) {
  return createHash('sha1').update(String(ua || '')).digest('hex').slice(0, 16);
}
