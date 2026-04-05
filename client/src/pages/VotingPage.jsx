import { useState, useEffect } from 'react';
import ProjectCard from '../components/ui/ProjectCard';
import { useLang } from '../context/LanguageContext';
import { useVoteStatus } from '../hooks/useVoteStatus';
import api from '../services/api';

export default function VotingPage() {
  const { t } = useLang();
  const { hasVoted, votedProjectId } = useVoteStatus();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects?limit=50')
      .then((res) => setProjects(res.data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sort: voted project first, then by voteCount desc
  const sorted = [...projects].sort((a, b) => {
    if (a._id === votedProjectId) return -1;
    if (b._id === votedProjectId) return 1;
    return b.voteCount - a.voteCount;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-secondary mb-3">{t('vote.subtitle')}</p>
        <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
          {t('vote.title')}
        </h1>
        {hasVoted && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-semibold">
            <span className="material-icon text-base material-icon-filled">check_circle</span>
            {t('vote.alreadyVoted')}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-surface-container-high animate-pulse h-72" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((p) => <ProjectCard key={p._id} project={p} showVoteCount />)}
        </div>
      )}
    </div>
  );
}
