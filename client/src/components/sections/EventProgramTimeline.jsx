import { useRef, useEffect, useState } from 'react';
import api from '../../services/api';

const FALLBACK = [
  { id: '1',  time: '14:00', startTime: '14:00:00', label: 'Welcome and Opening',            type: 'Opening'  },
  { id: '2',  time: '14:10', startTime: '14:10:00', label: 'Opening Remarks — Dean Jamali',  type: 'Remarks'  },
  { id: '3',  time: '14:15', startTime: '14:15:00', label: 'Guest Speaker Success Story',    type: 'Guest'    },
  { id: '4',  time: '14:18', startTime: '14:18:00', label: 'Moderated Exchange — Dean Jamali', type: 'Remarks'},
  { id: '5',  time: '14:25', startTime: '14:25:00', label: 'HR Manager Remarks',             type: 'Remarks'  },
  { id: '6',  time: '14:35', startTime: '14:35:00', label: 'TED-Style Talks',                type: 'TED Talk' },
  { id: '7',  time: '14:50', startTime: '14:50:00', label: 'Business Plan Elevator Pitches', type: 'Pitch'    },
  { id: '8',  time: '15:05', startTime: '15:05:00', label: 'Mock Interviews',                type: 'Interview'},
  { id: '9',  time: '15:30', startTime: '15:30:00', label: 'Jury Scoring & Reflections',     type: 'Jury'     },
  { id: '10', time: '15:35', startTime: '15:35:00', label: 'Announcement of Winners',        type: 'Closing'  },
  { id: '11', time: '15:40', startTime: '15:40:00', label: 'Closing Remarks',                type: 'Closing'  },
];

const TYPE_COLORS = {
  'Opening':   'text-secondary',
  'Remarks':   'text-on-surface-variant',
  'Guest':     'text-tertiary',
  'TED Talk':  'text-tertiary',
  'Pitch':     'text-tertiary',
  'Interview': 'text-tertiary',
  'Jury':      'text-on-surface-variant',
  'Closing':   'text-secondary',
};

const TEST_TIME = null;

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function computeStatuses(items) {
  const now = new Date();
  const nowMin = TEST_TIME ? toMinutes(TEST_TIME) : now.getHours() * 60 + now.getMinutes();
  return items.map((item, i) => {
    const itemMin = toMinutes(item.startTime);
    const nextMin = items[i + 1] ? toMinutes(items[i + 1].startTime) : Infinity;
    let status;
    if (nowMin >= nextMin)      status = 'done';
    else if (nowMin >= itemMin) status = 'active';
    else                        status = 'upcoming';
    return { ...item, status };
  });
}

export default function EventProgramTimeline() {
  const containerRef = useRef(null);
  const activeRef    = useRef(null);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    api.get('/schedule')
      .then((res) => setItems(res.data.items?.length > 0 ? res.data.items : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

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
    container.scrollTo({ top: Math.max(0, relativeTop - 72), behavior });
  };

  useEffect(() => {
    if (milestones.length > 0) scrollToActive('instant');
  }, [milestones.length, tick]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-card border border-outline-variant animate-pulse space-y-2">
        <div className="h-3 w-28 bg-surface-container rounded-full mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-surface-container rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-outline-variant">
      <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">
        Event Program
      </p>

      <div
        ref={containerRef}
        onMouseLeave={() => scrollToActive('smooth')}
        className="overflow-y-auto scrollbar-hide"
        style={{ height: '320px' }}
      >
        <div className="flex flex-col px-1 py-1">
          {milestones.map((m, i) => {
            const isDone    = m.status === 'done';
            const isActive  = m.status === 'active';
            const isLast    = i === milestones.length - 1;
            const typeColor = TYPE_COLORS[m.type] ?? 'text-on-surface-variant';

            return (
              <div
                key={m.id ?? m.time}
                ref={isActive ? activeRef : null}
                className="flex gap-3"
              >
                {/* Left: dot + line */}
                <div className="flex flex-col items-center" style={{ width: '16px', flexShrink: 0 }}>
                  {/* Dot */}
                  <div
                    style={{
                      width:  isActive ? '12px' : '6px',
                      height: isActive ? '12px' : '6px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      marginTop: isActive ? '10px' : '13px',
                      transition: 'all 0.3s ease',
                      backgroundColor: isActive
                        ? '#111111'
                        : isDone
                        ? '#c5c8d0'
                        : '#d1d5db',
                    }}
                  />
                  {/* Line */}
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        width: '1.5px',
                        minHeight: '8px',
                        backgroundColor: isDone ? '#c5c8d0' : '#e5e7eb',
                        marginTop: '3px',
                      }}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div
                  style={{
                    paddingBottom: isLast ? '4px' : '12px',
                    opacity: isDone ? 0.45 : isActive ? 1 : 0.75,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className="font-label font-bold tabular-nums text-on-surface"
                      style={{ fontSize: '10px' }}
                    >
                      {m.time}
                    </span>
                    <span
                      className={`font-label font-bold uppercase tracking-widest ${typeColor}`}
                      style={{ fontSize: '9px' }}
                    >
                      {m.type}
                    </span>
                    {isActive && (
                      <span
                        className="px-1.5 py-0.5 rounded-full bg-on-surface text-on-primary font-label font-bold uppercase tracking-widest"
                        style={{ fontSize: '8px' }}
                      >
                        Now
                      </span>
                    )}
                  </div>
                  <p
                    className={`leading-snug ${isActive ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}
                    style={{ fontSize: '12px' }}
                  >
                    {m.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
