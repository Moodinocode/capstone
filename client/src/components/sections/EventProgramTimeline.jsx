import { useRef, useEffect, useState } from 'react';
import api from '../../services/api';

const FALLBACK = [
  { id: '1',  time: '09:00', startTime: '09:00:00', label: 'Opening Ceremony',            type: 'Opening'    },
  { id: '2',  time: '09:30', startTime: '09:30:00', label: 'TED Talk: Emotional IQ',       type: 'TED Talk'   },
  { id: '3',  time: '09:50', startTime: '09:50:00', label: 'Project Pitches P-201–203',    type: 'Pitch'      },
  { id: '4',  time: '10:35', startTime: '10:35:00', label: 'Coffee Break',                 type: 'Break'      },
  { id: '5',  time: '10:45', startTime: '10:45:00', label: 'Project Pitches P-204–206',    type: 'Pitch'      },
  { id: '6',  time: '11:30', startTime: '11:30:00', label: 'TED Talk: Digital Leadership', type: 'TED Talk'   },
  { id: '7',  time: '11:50', startTime: '11:50:00', label: 'Project Pitches P-207–208',    type: 'Pitch'      },
  { id: '8',  time: '12:20', startTime: '12:20:00', label: 'Lunch Break',                  type: 'Break'      },
  { id: '9',  time: '13:00', startTime: '13:00:00', label: 'Project Pitches P-209–212',    type: 'Pitch'      },
  { id: '10', time: '14:00', startTime: '14:00:00', label: 'Expo & Networking',            type: 'Networking' },
  { id: '11', time: '14:30', startTime: '14:30:00', label: 'Awards & Closing Ceremony',    type: 'Closing'    },
];

const TYPE_COLORS = {
  'Opening':    'text-secondary',
  'TED Talk':   'text-tertiary',
  'Pitch':      'text-tertiary',
  'Break':      'text-on-surface-variant',
  'Networking': 'text-tertiary',
  'Closing':    'text-secondary',
};

// Set to e.g. '10:45' to pin the active item during testing. Set to null for real clock.
const TEST_TIME = '10:45';

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
