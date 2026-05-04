import { useEffect, useRef } from 'react';

/**
 * Subscribes to a Server-Sent Events endpoint with auto-reconnect.
 *
 * The browser's native EventSource already retries on dropped connections,
 * but on Render's free tier idle SSE sockets sometimes get closed cleanly
 * without an error event. We therefore add a watchdog that recreates the
 * connection if no event (including pings) has arrived for `staleMs`.
 *
 * @param {string|null} url            absolute or `/api/...` URL; pass null to disable
 * @param {Record<string, (data:any)=>void>} handlers map of event-name → callback
 * @param {object} [opts]
 * @param {number} [opts.staleMs=45000]
 */
export function useEventStream(url, handlers, opts = {}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!url) return undefined;

    let es = null;
    let watchdog = null;
    let lastEventAt = Date.now();
    let stopped = false;
    const staleMs = opts.staleMs ?? 45_000;

    function connect() {
      if (stopped) return;
      try {
        es?.close();
      } catch { /* noop */ }

      es = new EventSource(url);

      es.onopen = () => { lastEventAt = Date.now(); };
      es.onerror = () => {
        // Native retry will fire onopen again; if the proxy nuked the socket,
        // the watchdog below will force a fresh connection.
      };
      es.onmessage = (ev) => {
        lastEventAt = Date.now();
        try {
          const parsed = JSON.parse(ev.data);
          handlersRef.current?.message?.(parsed);
        } catch { /* ignore */ }
      };

      // Register named-event handlers (event: <name>).
      const names = Object.keys(handlersRef.current || {});
      for (const name of names) {
        if (name === 'message') continue;
        es.addEventListener(name, (ev) => {
          lastEventAt = Date.now();
          try {
            const parsed = ev.data ? JSON.parse(ev.data) : null;
            handlersRef.current[name]?.(parsed, ev);
          } catch (err) {
            handlersRef.current[name]?.(null, ev);
          }
        });
      }
    }

    connect();
    watchdog = setInterval(() => {
      if (Date.now() - lastEventAt > staleMs) {
        lastEventAt = Date.now();
        connect();
      }
    }, Math.max(staleMs / 2, 5_000));

    return () => {
      stopped = true;
      clearInterval(watchdog);
      try { es?.close(); } catch { /* noop */ }
    };
  }, [url, opts.staleMs]);
}
