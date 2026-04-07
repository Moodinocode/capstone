import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVoteStatus } from '../../hooks/useVoteStatus';
import api from '../../services/api';

const MEDAL_COLORS = [
  { bg: 'bg-secondary/15', border: 'border-secondary/40', text: 'text-secondary', label: '1st' },
  { bg: 'bg-surface-container', border: 'border-outline-variant', text: 'text-on-surface-variant', label: '2nd' },
  { bg: 'bg-tertiary/10', border: 'border-tertiary/30', text: 'text-tertiary', label: '3rd' },
];

const PODIUM_ORDER = [1, 0, 2]; // 2nd, 1st, 3rd (visual left→right)
const PODIUM_HEIGHTS = ['h-16', 'h-24', 'h-10'];

export default function FanVoteLeaderboard() {
  const { hasVoted, votedProjectId, castVote } = useVoteStatus();
  const [projects, setProjects] = useState([]);
  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects?limit=50')
      .then((res) => {
        const sorted = [...res.data.projects].sort((a, b) => b.voteCount - a.voteCount);
        setProjects(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (projectId) => {
    if (hasVoted || voting) return;
    setVoting(projectId);
    try {
      await castVote(projectId);
      // Refresh list
      const res = await api.get('/projects?limit=50');
      const sorted = [...res.data.projects].sort((a, b) => b.voteCount - a.voteCount);
      setProjects(sorted);
    } catch {
      // ignore
    } finally {
      setVoting(null);
    }
  };

  const top3   = projects.slice(0, 3);
  const topAll = projects.slice(0, 6);

  if (loading) {
    return (
      <div className="bg-surface-container-high rounded-2xl p-5 shadow-card border border-outline-variant space-y-3 animate-pulse">
        <div className="h-3 w-32 bg-surface-container rounded-full" />
        <div className="h-24 bg-surface-container rounded-xl" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-surface-container rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-high rounded-2xl p-5 shadow-card border border-outline-variant">
      <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-5">
        Top 3 &amp; Fan-Vote Leaderboard
      </p>

      {/* Podium */}
      {top3.length === 3 && (
        <div className="flex items-end justify-center gap-1.5 mb-6 px-2">
          {PODIUM_ORDER.map((rank, col) => {
            const p = top3[rank];
            const medal = MEDAL_COLORS[rank];
            const height = PODIUM_HEIGHTS[col];
            const isFirst = rank === 0;

            return (
              <div key={rank} className="flex-1 flex flex-col items-center gap-1">
                {/* Name above podium */}
                <p className={`text-[10px] font-label font-semibold text-center leading-tight ${isFirst ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {p.title.length > 12 ? p.title.slice(0, 12) + '…' : p.title}
                </p>
                <p className={`text-[9px] font-label ${medal.text}`}>
                  {p.voteCount} Votes
                </p>
                {/* Podium block */}
                <div className={`w-full ${height} rounded-t-lg border ${medal.border} ${medal.bg} flex items-center justify-center`}>
                  <span className={`text-sm font-headline font-extrabold ${medal.text}`}>
                    {rank + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Numbered list */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Fan-Vote Leaderboard
        </p>
        {topAll.map((p, i) => {
          const isVotedForThis = votedProjectId === p._id;
          const isVotingThis   = voting === p._id;

          return (
            <div
              key={p._id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-highest transition-colors duration-150"
            >
              {/* Rank */}
              <span className={`shrink-0 w-5 text-center text-xs font-headline font-bold
                ${i === 0 ? 'text-secondary' : i === 1 ? 'text-on-surface-variant' : i === 2 ? 'text-tertiary' : 'text-outline'}
              `}>
                {i + 1}.
              </span>

              {/* Name */}
              <span className="flex-1 text-xs font-label text-on-surface truncate">
                {p.title}
              </span>

              {/* Vote count */}
              <span className="shrink-0 text-[10px] text-on-surface-variant tabular-nums">
                ({p.voteCount})
              </span>

              {/* Vote button */}
              {isVotedForThis ? (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-label font-bold">
                  ✓ Voted
                </span>
              ) : (
                <button
                  onClick={() => handleVote(p._id)}
                  disabled={hasVoted || !!voting}
                  className="shrink-0 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-label font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-fixed transition-all duration-200"
                >
                  {isVotingThis ? '…' : 'Vote'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* View full link */}
      <Link
        to="/vote"
        className="mt-4 block text-center text-xs font-label font-semibold text-on-surface-variant hover:text-on-surface transition-colors duration-200"
      >
        View Full Leaderboard →
      </Link>
    </div>
  );
}
