import { useState, useEffect, useRef } from 'react';
import { useVoteStatus } from '../../hooks/useVoteStatus';
import api from '../../services/api';

const RANK_STYLE = [
  {
    border:   'border-amber-400',
    bg:       'bg-amber-50',
    rankBg:   'bg-amber-400',
    rankText: 'text-white',
    bar:      'bg-amber-400',
    glow:     'shadow-[0_0_14px_rgba(251,191,36,0.28)]',
  },
  {
    border:   'border-slate-300',
    bg:       'bg-slate-50',
    rankBg:   'bg-slate-400',
    rankText: 'text-white',
    bar:      'bg-slate-400',
    glow:     'shadow-[0_0_14px_rgba(148,163,184,0.22)]',
  },
  {
    border:   'border-orange-300',
    bg:       'bg-orange-50',
    rankBg:   'bg-orange-400',
    rankText: 'text-white',
    bar:      'bg-orange-400',
    glow:     'shadow-[0_0_14px_rgba(251,146,60,0.22)]',
  },
];

function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const diff  = value - prev.current;
    const steps = Math.min(Math.abs(diff), 20);
    const step  = diff / steps;
    let current = prev.current;
    let count   = 0;
    const id = setInterval(() => {
      count++;
      current += step;
      setDisplay(Math.round(current));
      if (count >= steps) {
        clearInterval(id);
        setDisplay(value);
        prev.current = value;
      }
    }, 30);
    return () => clearInterval(id);
  }, [value]);

  return <span className="tabular-nums">{display}</span>;
}

export default function FanVoteLeaderboard() {
  const { hasVoted, votedProjectId, castVote } = useVoteStatus();
  const [projects, setProjects]       = useState([]);
  const [voting, setVoting]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const containerRef = useRef(null);

  const fetchProjects = async () => {
    try {
      const res    = await api.get('/projects?limit=50');
      const sorted = [...res.data.projects].sort((a, b) => b.voteCount - a.voteCount);
      setProjects(sorted);
      setLastUpdated(new Date());
    } catch {}
  };

  useEffect(() => {
    fetchProjects().finally(() => setLoading(false));
    const id = setInterval(fetchProjects, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleVote = async (projectId) => {
    if (hasVoted || voting) return;
    setVoting(projectId);
    try {
      await castVote(projectId);
      await fetchProjects();
    } catch {}
    finally { setVoting(null); }
  };

  const totalVotes = projects.reduce((sum, p) => sum + p.voteCount, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-card border border-outline-variant space-y-2.5 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-3 w-36 bg-surface-container rounded-full" />
          <div className="h-4 w-10 bg-surface-container rounded-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-surface-container rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-outline-variant">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
          Fan Vote Leaderboard
        </p>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[9px] font-label text-on-surface-variant">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error text-[9px] font-label font-bold uppercase tracking-widest">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-error" />
            </span>
            Live
          </span>
        </div>
      </div>

      {/* Scrollable list */}
      <div
        ref={containerRef}
        onMouseLeave={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        className="overflow-y-auto scrollbar-hide space-y-2"
        style={{ height: '320px' }}
      >
        {projects.map((p, i) => {
          const style          = RANK_STYLE[i] ?? null;
          const isTop3         = i < 3;
          const isVotedForThis = votedProjectId === p._id;
          const isVotingThis   = voting === p._id;
          const pct            = totalVotes > 0 ? (p.voteCount / totalVotes) * 100 : 0;

          if (isTop3) {
            return (
              <div
                key={p._id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${style.border} ${style.bg} ${style.glow} transition-all duration-500`}
              >
                <div className={`shrink-0 w-7 h-7 rounded-lg ${style.rankBg} ${style.rankText} flex items-center justify-center`}>
                  <span className="text-xs font-headline font-extrabold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-label font-semibold text-on-surface truncate leading-tight mb-1.5">
                    {p.title}
                  </p>
                  <div className="w-full h-1 rounded-full bg-black/10">
                    <div
                      className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-label font-semibold text-on-surface-variant">
                  <AnimatedCount value={p.voteCount} />
                </span>
                {isVotedForThis ? (
                  <span className="shrink-0 px-2 py-1 rounded-lg bg-primary/15 text-primary text-[10px] font-label font-bold">
                    Voted
                  </span>
                ) : (
                  <button
                    onClick={() => handleVote(p._id)}
                    disabled={hasVoted || !!voting}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[10px] font-label font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-fixed transition-all duration-200"
                  >
                    {isVotingThis ? '…' : 'Vote'}
                  </button>
                )}
              </div>
            );
          }

          return (
            <div
              key={p._id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-outline-variant bg-white hover:bg-surface-container-low transition-colors duration-150"
            >
              <span className="shrink-0 w-5 text-center text-xs font-headline font-bold text-outline">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-label text-on-surface truncate">{p.title}</p>
                <div className="w-full h-0.5 rounded-full bg-black/10 mt-1">
                  <div
                    className="h-full rounded-full bg-on-surface transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-label text-on-surface-variant">
                <AnimatedCount value={p.voteCount} />
              </span>
              {isVotedForThis ? (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-label font-bold">✓</span>
              ) : (
                <button
                  onClick={() => handleVote(p._id)}
                  disabled={hasVoted || !!voting}
                  className="shrink-0 px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-label font-bold disabled:opacity-40 hover:bg-primary-fixed transition-all"
                >
                  {isVotingThis ? '…' : 'Vote'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
