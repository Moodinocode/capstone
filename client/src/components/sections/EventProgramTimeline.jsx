const MILESTONES = [
  { time: '09:00', label: 'Opening Ceremony',       type: 'Opening',    status: 'done' },
  { time: '09:30', label: 'TED Talk: Emotional IQ', type: 'TED Talk',   status: 'done' },
  { time: '09:50', label: 'Project Pitches P-201–203', type: 'Pitch',   status: 'active' },
  { time: '10:35', label: 'Coffee Break',            type: 'Break',      status: 'upcoming' },
  { time: '10:45', label: 'Project Pitches P-204–206', type: 'Pitch',   status: 'upcoming' },
  { time: '11:30', label: 'TED Talk: Digital Leadership', type: 'TED Talk', status: 'upcoming' },
  { time: '11:50', label: 'Project Pitches P-207–208', type: 'Pitch',   status: 'upcoming' },
  { time: '12:20', label: 'Lunch Break',             type: 'Break',      status: 'upcoming' },
  { time: '13:00', label: 'Project Pitches P-209–212', type: 'Pitch',   status: 'upcoming' },
  { time: '14:00', label: 'Expo & Networking',       type: 'Networking', status: 'upcoming' },
  { time: '14:30', label: 'Awards & Closing Ceremony', type: 'Closing', status: 'upcoming' },
];

const TYPE_COLORS = {
  'Opening':    'text-secondary',
  'TED Talk':   'text-primary',
  'Pitch':      'text-on-surface-variant',
  'Break':      'text-outline',
  'Networking': 'text-tertiary',
  'Closing':    'text-secondary',
};

export default function EventProgramTimeline() {
  return (
    <div className="bg-surface-container-high rounded-2xl p-5 shadow-card">
      <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-5">
        Event Program
      </p>

      <div className="space-y-0">
        {MILESTONES.map((m, i) => {
          const isDone   = m.status === 'done';
          const isActive = m.status === 'active';
          const isLast   = i === MILESTONES.length - 1;
          const typeColor = TYPE_COLORS[m.type] ?? 'text-on-surface-variant';

          return (
            <div key={i} className="flex gap-3">
              {/* Left: connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-colors
                  ${isDone   ? 'bg-primary/20 border-primary' : ''}
                  ${isActive ? 'bg-primary border-primary shadow-glow-primary' : ''}
                  ${!isDone && !isActive ? 'bg-surface-container border-outline-variant' : ''}
                `}>
                  {isDone && (
                    <span className="material-icon text-xs text-primary material-icon-filled">check</span>
                  )}
                  {isActive && (
                    <span className="material-icon text-xs text-on-primary material-icon-filled">check</span>
                  )}
                  {!isDone && !isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-px flex-1 my-0.5 min-h-[1.25rem] ${isDone ? 'bg-primary/30' : 'bg-outline-variant/30'}`} />
                )}
              </div>

              {/* Right: time + label */}
              <div className="pb-4 min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className={`text-[10px] font-label font-bold tabular-nums shrink-0
                    ${isActive ? 'text-primary' : 'text-on-surface-variant'}
                  `}>
                    {m.time}
                  </p>
                  <span className={`text-[9px] font-label font-bold uppercase tracking-widest shrink-0 ${typeColor}`}>
                    {m.type}
                  </span>
                </div>
                <p className={`text-xs leading-snug mt-0.5
                  ${isActive ? 'text-on-surface font-semibold' : isDone ? 'text-on-surface-variant/60' : 'text-on-surface-variant'}
                `}>
                  {m.label}
                </p>
                {isActive && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-label font-bold uppercase tracking-widest">
                    Now
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
