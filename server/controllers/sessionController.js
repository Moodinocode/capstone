import supabase from '../config/supabase.js';
import { addClient, removeClient, broadcast } from '../services/eventBus.js';
import { audit } from '../utils/audit.js';
import logger from '../utils/logger.js';

const shapeSession = (row) => ({
  _id: row.id,
  key: row.key,
  isEventLive: row.is_event_live,
  nowPlaying: row.now_playing ?? {},
  upNext: row.up_next ?? {},
  voteCountVisible: row.now_playing?.voteCountVisible ?? true,
  isPublic: row.now_playing?.isPublic ?? true,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function readMain() {
  let { data } = await supabase
    .from('live_sessions').select('*').eq('key', 'main').single();
  if (!data) {
    const { data: created } = await supabase
      .from('live_sessions').insert({ key: 'main' }).select().single();
    data = created;
  }
  return data;
}

export const getSession = async (_req, res) => {
  const data = await readMain();
  res.json(shapeSession(data));
};

/**
 * GET /api/session/stream — Server-Sent Events.
 * Browsers automatically reconnect on drop; the heartbeat in eventBus.js
 * keeps idle proxies (Render, Cloudflare) from killing the socket.
 */
export const streamSession = (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  // Send the current snapshot so newly connected clients render immediately.
  readMain()
    .then((row) => res.write(`event: session.snapshot\ndata: ${JSON.stringify(shapeSession(row))}\n\n`))
    .catch((err) => logger.warn({ err: err.message }, 'sse snapshot failed'));

  addClient(res);
  req.on('close', () => removeClient(res));
};

export const setVotesVisible = async (req, res) => {
  const { visible } = req.body;

  const { data: existing } = await supabase
    .from('live_sessions').select('now_playing').eq('key', 'main').single();
  const nowPlaying = { ...(existing?.now_playing ?? {}), voteCountVisible: visible };

  const { data, error } = await supabase
    .from('live_sessions')
    .upsert({ key: 'main', now_playing: nowPlaying, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select().single();

  if (error) return res.status(500).json({ message: error.message });

  audit({
    actorType: 'judge',
    actorId: req.judge?._id,
    action: 'session.set_votes_visible',
    targetType: 'session',
    targetId: 'main',
    metadata: { visible },
    ip: req.ip,
  });
  broadcast('session.update', shapeSession(data));

  res.json({ voteCountVisible: visible });
};

export const setPublic = async (req, res) => {
  const { public: isPublic } = req.body;

  const { data: existing } = await supabase
    .from('live_sessions').select('now_playing').eq('key', 'main').single();
  const nowPlaying = { ...(existing?.now_playing ?? {}), isPublic };

  const { data, error } = await supabase
    .from('live_sessions')
    .upsert({ key: 'main', now_playing: nowPlaying, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select().single();

  if (error) return res.status(500).json({ message: error.message });

  audit({
    actorType: 'judge',
    actorId: req.judge?._id,
    action: 'session.set_public',
    targetType: 'session',
    targetId: 'main',
    metadata: { isPublic },
    ip: req.ip,
  });
  broadcast('session.update', shapeSession(data));

  res.json({ isPublic });
};

export const updateSession = async (req, res) => {
  const { nowPlaying, upNext, isEventLive } = req.body;

  const { data, error } = await supabase
    .from('live_sessions')
    .upsert(
      {
        key: 'main',
        now_playing: nowPlaying,
        up_next: upNext,
        is_event_live: isEventLive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  audit({
    actorType: 'judge',
    actorId: req.judge?._id,
    action: 'session.update',
    targetType: 'session',
    targetId: 'main',
    metadata: { nowPlaying, upNext, isEventLive },
    ip: req.ip,
  });
  broadcast('session.update', shapeSession(data));

  res.json(shapeSession(data));
};
