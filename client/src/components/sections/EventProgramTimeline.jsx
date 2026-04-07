import { useRef, useEffect, useState } from 'react';
import api from '../../services/api';

const TYPE_COLORS = {
  'Opening':    'text-secondary',
  'TED Talk':   'text-tertiary',
  'Pitch':      'text-on-surface-variant',
  'Break':      'text-outline',
  'Networking': 'text-tertiary',
  'Closing':    'text-secondary',
};

// Convert "HH:MM:SS" or "HH:MM" to total minutes since midnight
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Given a sorted list of items (each with startTime), compute status from current clock
function computeStatuses(items) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return items.map((item, i) => {
    const itemMin = toMinutes(item.startTime);
    const nextMin = items[i + 1] ? toMinutes(items[i + 1].startTime) : Infinity;

    let status;
    if (nowMin >= nextMin)    status = 'done';
    else if (nowMin >= itemMin) status = 'active';
    else                        status = 'upcoming';

    return { ...item, status };
  });
}

export default function EventProgramTimeline() {
  const containerRef = useRef(null);
  const activeRef    = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch once on mount
  useEffect(() => {
    api.get('/schedule')
      .then((res) => setItems(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Re-compute statuses every minute so the timeline updates automatically
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const milestones = computeStatuses(items);

  const scrollToActive = (behavior = 'smooth') => {
    const container = containerRef.current;
    const active    = activeRef.current;
    if (!container || !active) return;
    const containerRect = container.getBoundingClientRect();
    const activeRect    = active.getBoundingClientRect();
    const relativeTop   = activeRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({ top: Math.max(0, relativeTop - 56), behavior });
  };

  // Scroll to active whenever milestones update (including after fetch + every tick)
  useEffect(() => {
    if (milestones.length > 0) scrollToActive('instant');
  }, [milestones.length, tick]);

  if (loading) {
    return (
      <div className="bg-surface-container-high rounded-2xl p-5 shadow-card border border-outline-variant animate-pulse space-y-3">
        <div className="h-3 w-28 bg-surface-container rounded-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-surface-container shrink-0" />
            <div className="flex-1 h-10 bg-surface-container rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-high rounded-2xl p-5 shadow-card border border-outline-variant">
      <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-5">
        Event Program
      </p>

      {/* Scrollable container — snaps back to active on mouse leave */}
      <div
        ref={containerRef}
        onMouseLeave={() => scrollToActive('smooth')}
        className="overflow-y-auto scrollbar-hide"
        style={{ height: '280px' }}
      >
        <div className="space-y-0">
          {milestones.map((m, i) => {
            const isDone   = m.status === 'done';
            const isActive = m.status === 'active';
            const isLast   = i === milestones.length - 1;
            const typeColor = TYPE_COLORS[m.type] ?? 'text-on-surface-variant';

            return (
              <div
                key={m.id ?? m.time}
                ref={isActive ? activeRef : null}
                className={`flex gap-3 transition-opacity duration-300 ${isDone ? 'opacity-35' : 'opacity-100'}`}
              >
                {/* Left: dot + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-colors
                    ${isDone   ? 'bg-surface-container border-on-surface/20' : ''}
                    ${isActive ? 'bg-on-surface border-on-surface' : ''}
                    ${!isDone && !isActive ? 'bg-surface border-outline-variant' : ''}
                  `}>
                    {isDone && (
                      <span className="material-icon text-xs text-on-surface-variant material-icon-filled">check</span>
                    )}
                    {isActive && (
                      <span className="material-icon text-xs text-on-primary material-icon-filled">check</span>
                    )}
                    {!isDone && !isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-outline" />
                    )}
                  </div>
                  {!isLast && (
                    <div className={`w-px flex-1 my-0.5 min-h-[1.25rem] ${isDone ? 'bg-on-surface/15' : 'bg-outline-variant'}`} />
                  )}
                </div>

                {/* Right: content */}
                {isActive ? (
                  <div
                    className="mb-4 flex-1 -mx-1 px-3 py-2.5 bg-white rounded-xl border border-outline relative z-10"
                    style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex items-baseline gap-2">
                      <p className="text-[10px] font-label font-bold tabular-nums shrink-0 text-on-surface">{m.time}</p>
                      <span className={`text-[9px] font-label font-bold uppercase tracking-widest shrink-0 ${typeColor}`}>{m.type}</span>
                    </div>
                    <p className="text-xs leading-snug mt-0.5 text-on-surface font-semibold">{m.label}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-on-surface text-on-primary text-[9px] font-label font-bold uppercase tracking-widest">
                      Now
                    </span>
                  </div>
                ) : (
                  <div className="pb-4 min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-[10px] font-label font-bold tabular-nums shrink-0 text-on-surface-variant">{m.time}</p>
                      <span className={`text-[9px] font-label font-bold uppercase tracking-widest shrink-0 ${typeColor}`}>{m.type}</span>
                    </div>
                    <p className="text-xs leading-snug mt-0.5 text-on-surface-variant">{m.label}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
