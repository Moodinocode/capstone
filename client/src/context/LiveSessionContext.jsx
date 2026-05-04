import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useEventStream } from '../hooks/useEventStream';

const LiveSessionContext = createContext(null);

// Resolve a stream URL on the same origin as the API.
// VITE_API_URL is normally `/api` (proxied). For absolute backend URLs we
// strip the trailing /api and append the SSE path.
function resolveStreamUrl() {
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base.replace(/\/$/, '')}/session/stream`;
}

const USE_SSE = (import.meta.env.VITE_USE_SSE ?? 'true') !== 'false';

export function LiveSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await api.get('/session');
      setSession(res.data);
    } catch {
      // silently fail — session data is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load is always REST so the page renders even if SSE is blocked.
  useEffect(() => { fetchSession(); }, [fetchSession]);

  // SSE pushes — `session.snapshot` arrives on connect, `session.update` on
  // every admin change. We also re-fetch on `vote.cast` so leaderboards stay
  // current without polling.
  useEventStream(USE_SSE ? resolveStreamUrl() : null, {
    'session.snapshot': (data) => data && setSession(data),
    'session.update':   (data) => data && setSession(data),
    'vote.cast':        () => { /* downstream components can refetch counts */ },
  });

  // Polling fallback — runs only if SSE is disabled (or as a backup safety net
  // every 60s when SSE is on, in case a push was missed entirely).
  useEffect(() => {
    const intervalMs = USE_SSE ? 60_000 : 30_000;
    const id = setInterval(fetchSession, intervalMs);
    return () => clearInterval(id);
  }, [fetchSession]);

  const nowPlaying = session?.nowPlaying ?? null;
  const upNext = session?.upNext ?? null;
  const isEventLive = session?.isEventLive ?? false;
  const voteCountVisible = session?.voteCountVisible ?? true;
  const isPublic = session?.isPublic ?? true;

  return (
    <LiveSessionContext.Provider
      value={{
        nowPlaying,
        upNext,
        isEventLive,
        voteCountVisible,
        isPublic,
        loading,
        refetch: fetchSession,
        transport: USE_SSE ? 'sse' : 'polling',
      }}
    >
      {children}
    </LiveSessionContext.Provider>
  );
}

export const useLiveSession = () => useContext(LiveSessionContext);
