import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const LiveSessionContext = createContext(null);

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

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 30000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  const nowPlaying = session?.nowPlaying ?? null;
  const upNext = session?.upNext ?? null;
  const isEventLive = session?.isEventLive ?? false;

  return (
    <LiveSessionContext.Provider value={{ nowPlaying, upNext, isEventLive, loading, refetch: fetchSession }}>
      {children}
    </LiveSessionContext.Provider>
  );
}

export const useLiveSession = () => useContext(LiveSessionContext);
