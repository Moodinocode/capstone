import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { useVoteStatus } from '../../hooks/useVoteStatus';
import GlassModal from './GlassModal';

export default function HubProjectCard({ project, totalVotes = 0, index = 0 }) {
  const { t, lang } = useLang();
  const { hasVoted, votedProjectId, castVote } = useVoteStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  const title = lang === 'ar' && project.titleAr ? project.titleAr : project.title;
  const desc  = lang === 'ar' && project.descriptionAr ? project.descriptionAr : project.description;

  const isVotedForThis = votedProjectId === project._id;
  const progressPct = totalVotes > 0 ? Math.round((project.voteCount / totalVotes) * 100) : 0;
  const projectNum = String(index + 1).padStart(2, '0');

  const handleVote = async () => {
    if (hasVoted) { setError(t('vote.alreadyVoted')); return; }
    setVoting(true);
    try {
      await castVote(project._id);
      setConfirmOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setVoting(false);
    }
  };

  return (
    <>
      <div className="group relative bg-surface-container-high rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all duration-300 shadow-card hover:shadow-card-hover flex flex-col">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden shrink-0">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
              <span className="material-icon text-4xl text-on-surface-variant">science</span>
            </div>
          )}
          {/* Live badge */}
          {project.isLive && (
            <div className="absolute top-2 end-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/90 text-[9px] font-label font-bold uppercase tracking-widest text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                Live
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Project number + title */}
          <Link to={`/projects/${project._id}`} className="group/link">
            <p className="text-xs font-label font-semibold text-primary mb-1">
              Project {projectNum}:
            </p>
            <h3 className="font-headline font-bold text-sm text-on-surface group-hover/link:text-primary transition-colors duration-200 leading-snug mb-2 line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 flex-1 mb-3">{desc}</p>

          {/* Progress bar */}
          <div className="mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-label text-on-surface-variant">{project.voteCount} votes</span>
              <span className="text-[10px] font-label text-primary">{progressPct}%</span>
            </div>
            <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Vote button — full width at bottom */}
        {isVotedForThis ? (
          <div className="mx-4 mb-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-label font-semibold">
            <span className="material-icon text-base material-icon-filled">thumb_up</span>
            Voted · {project.voteCount} Votes
          </div>
        ) : (
          <button
            onClick={() => hasVoted ? setError(t('vote.alreadyVoted')) : setConfirmOpen(true)}
            disabled={hasVoted}
            className="mx-4 mb-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/20 hover:bg-primary text-primary hover:text-on-primary text-sm font-label font-semibold border border-primary/30 hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group/btn"
          >
            <span className="material-icon text-base">thumb_up</span>
            Vote · {project.voteCount} Votes
          </button>
        )}

        {error && <p className="text-xs text-error px-4 pb-3 -mt-2">{error}</p>}
      </div>

      {/* Vote confirmation modal */}
      <GlassModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t('vote.confirm')}>
        <p className="text-on-surface-variant text-sm mb-6">
          {t('vote.confirmMsg')} <span className="text-on-surface font-semibold">"{title}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmOpen(false)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {t('vote.cancel')}
          </button>
          <button
            onClick={handleVote}
            disabled={voting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:shadow-glow-primary disabled:opacity-50 transition-all duration-200"
          >
            {voting ? t('grade.saving') : t('vote.cast')}
          </button>
        </div>
      </GlassModal>
    </>
  );
}
