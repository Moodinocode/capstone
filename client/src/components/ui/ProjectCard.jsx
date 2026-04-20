import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVoteStatus } from '../../hooks/useVoteStatus';
import GlassModal from './GlassModal';

const CATEGORY_COLORS = {
  'Engineering':       'bg-white/90 text-on-surface border border-outline-variant',
  'Tech Innovation':   'bg-white/90 text-tertiary border border-tertiary/30',
  'Social Impact':     'bg-white/90 text-secondary border border-secondary/30',
  'Business Strategy': 'bg-white/90 text-on-surface border border-outline-variant',
  'Creative Arts':     'bg-white/90 text-tertiary border border-tertiary/30',
  'Med-Tech':          'bg-white/90 text-error border border-error/30',
};

export default function ProjectCard({ project, showVoteCount = false }) {
  const { hasVoted, votedProjectId, castVote } = useVoteStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  const title = project.title;
  const desc  = project.description;
  const team  = project.teamName;
  const catColor = CATEGORY_COLORS[project.category] ?? 'bg-white/90 text-on-surface-variant border border-outline-variant';

  const isVotedForThis = votedProjectId === project._id;

  const handleVote = async () => {
    if (hasVoted) { setError('You have already voted.'); return; }
    setVoting(true);
    try {
      await castVote(project._id);
      setConfirmOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-card hover:shadow-card-hover border border-outline-variant">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-surface-container flex items-center justify-center">
              <span className="material-icon text-4xl text-on-surface-variant">science</span>
            </div>
          )}
          {/* Category overlay */}
          <div className="absolute top-3 start-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-widest ${catColor}`}>
              {project.category}
            </span>
          </div>
          {/* Live badge */}
          {project.isLive && (
            <div className="absolute top-3 end-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-error text-[10px] font-label font-bold uppercase tracking-widest text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                Presenting
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs font-label text-on-surface-variant mb-1 uppercase tracking-widest">{team}</p>
          <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-on-surface-variant transition-colors duration-200 mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4">{desc}</p>

          {showVoteCount && (
            <p className="text-xs font-label text-on-surface-variant mb-3">
              <span className="text-on-surface font-semibold">{project.voteCount}</span> votes
            </p>
          )}

          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${project._id}`}
              className="flex-1 text-center py-2 rounded-xl text-sm font-label font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors duration-200 border border-outline-variant"
            >
              View Details
            </Link>
            {isVotedForThis ? (
              <span className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-label font-semibold text-secondary bg-secondary/10 border border-secondary/20">
                <span className="material-icon text-base material-icon-filled">check_circle</span>
                Voted
              </span>
            ) : (
              <button
                onClick={() => hasVoted ? setError('You have already voted.') : setConfirmOpen(true)}
                disabled={hasVoted}
                className="px-4 py-2 rounded-xl text-sm font-label font-semibold bg-primary text-on-primary hover:bg-primary-fixed disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Vote Now
              </button>
            )}
          </div>
          {error && <p className="text-xs text-error mt-2">{error}</p>}
        </div>
      </div>

      {/* Vote confirmation modal */}
      <GlassModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Your Vote">
        <p className="text-on-surface-variant text-sm mb-6">
          Are you sure you want to vote for <span className="text-on-surface font-semibold">"{title}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant"
          >
            Cancel
          </button>
          <button
            onClick={handleVote}
            disabled={voting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary-fixed disabled:opacity-50 transition-all duration-200"
          >
            {voting ? 'Saving...' : 'Cast Vote'}
          </button>
        </div>
      </GlassModal>
    </>
  );
}
