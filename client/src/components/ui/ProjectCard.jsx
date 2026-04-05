import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { useVoteStatus } from '../../hooks/useVoteStatus';
import GlassModal from './GlassModal';

const CATEGORY_COLORS = {
  'Engineering':       'bg-primary/20 text-primary',
  'Tech Innovation':   'bg-tertiary/20 text-tertiary',
  'Social Impact':     'bg-secondary/20 text-secondary',
  'Business Strategy': 'bg-on-primary-container/20 text-primary-dim',
  'Creative Arts':     'bg-tertiary-container/20 text-tertiary-fixed',
  'Med-Tech':          'bg-error/20 text-error',
};

export default function ProjectCard({ project, showVoteCount = false }) {
  const { t, lang } = useLang();
  const { hasVoted, votedProjectId, castVote } = useVoteStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  const title = lang === 'ar' && project.titleAr ? project.titleAr : project.title;
  const desc  = lang === 'ar' && project.descriptionAr ? project.descriptionAr : project.description;
  const team  = lang === 'ar' && project.teamNameAr ? project.teamNameAr : project.teamName;
  const catColor = CATEGORY_COLORS[project.category] ?? 'bg-surface-container-high text-on-surface-variant';

  const isVotedForThis = votedProjectId === project._id;

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
      <div className="group relative bg-surface-container-high rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
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
          {/* Category overlay */}
          <div className="absolute top-3 start-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-widest backdrop-blur-sm ${catColor}`}>
              {project.category}
            </span>
          </div>
          {/* Live badge */}
          {project.isLive && (
            <div className="absolute top-3 end-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-error/90 text-[10px] font-label font-bold uppercase tracking-widest backdrop-blur-sm text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                {t('projects.presenting')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs font-label text-on-surface-variant mb-1 uppercase tracking-widest">{team}</p>
          <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors duration-200 mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4">{desc}</p>

          {showVoteCount && (
            <p className="text-xs font-label text-on-surface-variant mb-3">
              <span className="text-secondary font-semibold">{project.voteCount}</span> {t('vote.votes')}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${project._id}`}
              className="flex-1 text-center py-2 rounded-xl text-sm font-label font-semibold text-primary hover:bg-primary/10 transition-colors duration-200"
            >
              {t('projects.viewDetails')}
            </Link>
            {isVotedForThis ? (
              <span className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-label font-semibold text-secondary bg-secondary/10">
                <span className="material-icon text-base material-icon-filled">check_circle</span>
                {t('vote.voted')}
              </span>
            ) : (
              <button
                onClick={() => hasVoted ? setError(t('vote.alreadyVoted')) : setConfirmOpen(true)}
                disabled={hasVoted}
                className="px-4 py-2 rounded-xl text-sm font-label font-semibold bg-primary text-on-primary hover:shadow-glow-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {t('projects.voteNow')}
              </button>
            )}
          </div>
          {error && <p className="text-xs text-error mt-2">{error}</p>}
        </div>
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
