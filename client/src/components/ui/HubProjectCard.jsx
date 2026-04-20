import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoteStatus } from '../../hooks/useVoteStatus';
import { useLiveSession } from '../../context/LiveSessionContext';
import GlassModal from './GlassModal';

export default function HubProjectCard({ project, totalVotes = 0, index = 0 }) {
  const navigate = useNavigate();
  const { hasVoted, votedProjectId, castVote } = useVoteStatus();
  const { voteCountVisible } = useLiveSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

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
      <div
        className="group relative bg-surface-container rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-outline-variant cursor-pointer"
        onClick={() => navigate(`/projects/${project._id}`)}
      >
        {/* Poster image */}
        <div className="relative aspect-[3/4] bg-surface-container">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-icon text-4xl text-on-surface-variant">science</span>
            </div>
          )}

          {/* Bottom overlay: title + vote */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pt-10 pb-3">
            {project.teamName && (
              <p className="text-[10px] font-label text-white/70 mb-0.5 truncate">{project.teamName}</p>
            )}
            <p className="text-sm font-headline font-bold text-white leading-tight line-clamp-2 mb-2.5">
              {project.title}
            </p>

            {isVotedForThis ? (
              <div
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/20 text-white text-xs font-label font-semibold border border-white/30"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-icon text-sm material-icon-filled">check_circle</span>
                Voted{voteCountVisible ? ` · ${project.voteCount}` : ''}
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  hasVoted ? setError('You have already voted.') : setConfirmOpen(true);
                }}
                disabled={hasVoted}
                className="w-full py-2 rounded-xl bg-primary text-on-primary text-xs font-label font-semibold hover:bg-primary-fixed disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <span className="material-icon text-sm">thumb_up</span>
                Vote{voteCountVisible ? ` · ${project.voteCount}` : ''}
              </button>
            )}
            {error && <p className="text-[10px] text-red-300 mt-1.5 text-center">{error}</p>}
          </div>

          {/* Live badge */}
          {project.isLive && (
            <div className="absolute top-2 end-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error text-[9px] font-label font-bold uppercase tracking-widest text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                Live
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Vote confirmation modal */}
      <GlassModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Your Vote">
        <p className="text-on-surface-variant text-sm mb-6">
          Are you sure you want to vote for <span className="text-on-surface font-semibold">"{project.title}"</span>?
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
