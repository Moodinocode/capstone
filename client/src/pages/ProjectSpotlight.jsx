import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useVoteStatus } from '../hooks/useVoteStatus';
import GlassModal from '../components/ui/GlassModal';
import api from '../services/api';

const CATEGORY_COLORS = {
  'Engineering':       'bg-primary/20 text-primary',
  'Tech Innovation':   'bg-tertiary/20 text-tertiary',
  'Social Impact':     'bg-secondary/20 text-secondary',
  'Business Strategy': 'bg-primary-dim/20 text-primary-dim',
  'Creative Arts':     'bg-tertiary-fixed/20 text-tertiary-fixed',
  'Med-Tech':          'bg-error/20 text-error',
};

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const danger = elapsed >= 90;
  const warn   = elapsed >= 60 && !danger;

  const size = 280;
  const cx = size / 2;
  const r  = 118;
  const circumference = 2 * Math.PI * r;
  const maxSec  = 120;
  const progress = Math.min(elapsed / maxSec, 1);

  const ringColor  = danger ? '#ef4444' : warn ? '#f59e0b' : '#111827';
  const faceColor  = danger ? '#fff5f5' : warn ? '#fffbeb' : '#ffffff';
  const textColor  = danger ? '#ef4444' : warn ? '#d97706' : '#111827';

  // 12 tick marks like a clock
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 3 === 0;
    const inner = isMajor ? r - 14 : r - 9;
    const outer = r - 2;
    return {
      x1: cx + inner * Math.cos(angle),
      y1: cx + inner * Math.sin(angle),
      x2: cx + outer * Math.cos(angle),
      y2: cx + outer * Math.sin(angle),
      isMajor,
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Outer border ring */}
          <circle cx={cx} cy={cx} r={cx - 4} fill="none"
            stroke={ringColor} strokeWidth="4"
            style={{ transition: 'stroke 0.5s ease' }}
          />

          {/* Clock face background */}
          <circle cx={cx} cy={cx} r={r - 2} fill={faceColor}
            style={{ transition: 'fill 0.5s ease' }}
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={danger ? '#fca5a5' : warn ? '#fcd34d' : '#d1d5db'}
              strokeWidth={t.isMajor ? 3 : 1.5}
              strokeLinecap="round"
            />
          ))}

          {/* Progress arc (behind face, on the ring) */}
          <circle cx={cx} cy={cx} r={r} fill="none"
            stroke={ringColor} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform={`rotate(-90 ${cx} ${cx})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease', opacity: 0.25 }}
          />

          {/* Center dot */}
          <circle cx={cx} cy={cx} r="5" fill={ringColor}
            style={{ transition: 'fill 0.5s ease' }}
          />
        </svg>

        {/* Time display overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline font-extrabold tabular-nums leading-none"
            style={{ fontSize: '72px', color: textColor, transition: 'color 0.5s ease' }}>
            {mm}:{ss}
          </span>
          <span className="text-xs font-label uppercase tracking-widest mt-1"
            style={{ color: danger ? '#ef4444' : warn ? '#d97706' : '#9ca3af' }}>
            {running ? 'running' : elapsed > 0 ? 'paused' : 'ready'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-label font-bold shadow-md transition-all duration-200 ${
            running ? 'bg-gray-900 text-white' : 'bg-primary text-on-primary hover:bg-primary-fixed'
          }`}
        >
          <span className="material-icon text-base">{running ? 'pause' : 'play_arrow'}</span>
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => { setElapsed(0); setRunning(false); }}
          className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-label font-bold bg-white border border-gray-200 text-gray-500 hover:text-gray-800 shadow-md transition-colors"
        >
          <span className="material-icon text-base">restart_alt</span>
          Reset
        </button>
      </div>
    </div>
  );
}

export default function ProjectSpotlight() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasVoted, votedProjectId, castVote } = useVoteStatus();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState('');

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="rounded-3xl bg-surface-container-high animate-pulse h-96 mb-8" />
    </div>
  );

  if (!project) return (
    <div className="text-center py-24 text-on-surface-variant">Project not found.</div>
  );

  const title       = project.title;
  const description = project.description;
  const team        = project.teamName;
  const catColor    = CATEGORY_COLORS[project.category] ?? 'bg-surface-container-high text-on-surface-variant';
  const isVotedForThis = votedProjectId === project._id;

  const handleVote = async () => {
    if (hasVoted) return;
    setVoting(true);
    try {
      await castVote(project._id);
      setConfirmOpen(false);
    } catch (err) {
      setVoteError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-8 transition-colors">
        <span className="material-icon text-base">arrow_back</span>
        Back to Gallery
      </button>

      {/* Stopwatch — fixed right side, vertically centered */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50">
        <Stopwatch />
      </div>

      {/* Hero — image or PDF poster */}
      {project.imageUrl ? (
        <div className="relative rounded-3xl overflow-hidden aspect-[3/4] mb-8 bg-surface-container">
          <img src={project.imageUrl} alt={title} className="w-full h-full object-contain" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,39,68,0.35) 0%, transparent 40%)' }} />
          {project.isLive && (
            <div className="absolute top-4 start-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error/90 text-white text-xs font-label font-bold uppercase tracking-widest">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                Presenting
              </span>
            </div>
          )}
        </div>
      ) : project.documentUrl?.endsWith('.pdf') && (
        <div className="rounded-3xl overflow-hidden mb-8 bg-surface-container border border-outline-variant" style={{ height: '520px' }}>
          <iframe
            src={project.documentUrl}
            title={`${title} poster`}
            className="w-full h-full border-0"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-label font-bold uppercase tracking-widest mb-4 ${catColor}`}>
            {project.category}
          </span>
          <h1 className="font-headline font-extrabold text-3xl md:text-5xl text-on-surface tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p className="text-on-surface-variant text-lg mb-8 font-headline">{team}</p>

          <p className="text-on-surface-variant leading-relaxed mb-8">{description}</p>

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-label font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Team members */}
          {project.members?.length > 0 && (
            <div>
              <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">Team</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {project.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-high">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="material-icon text-primary">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{m.name}</p>
                      <p className="text-xs text-on-surface-variant">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Vote card */}
          <div className="p-6 rounded-3xl bg-surface-container-high">
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">People's Choice</p>
            <p className="text-3xl font-headline font-bold text-secondary mb-1">{project.voteCount}</p>
            <p className="text-xs text-on-surface-variant mb-6">votes</p>
            {isVotedForThis ? (
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-icon material-icon-filled">check_circle</span>
                <span className="text-sm font-semibold">Voted</span>
              </div>
            ) : (
              <button
                onClick={() => hasVoted ? setVoteError('You have already voted.') : setConfirmOpen(true)}
                disabled={hasVoted}
                className="w-full py-3 rounded-xl font-label font-semibold bg-primary text-on-primary hover:shadow-glow-primary disabled:opacity-40 transition-all duration-200"
              >
                Vote Now
              </button>
            )}
            {voteError && <p className="text-xs text-error mt-2">{voteError}</p>}
          </div>

          {/* Actions */}
          <div className="p-6 rounded-3xl bg-surface-container-high flex flex-col gap-3">
            {project.zoomLink && (
              <a href={project.zoomLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                <span className="material-icon">videocam</span>
                Join Zoom
              </a>
            )}
            {project.documentUrl && (
              <a href={project.documentUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-surface-container-highest text-on-surface-variant text-sm font-semibold hover:text-on-surface transition-colors">
                <span className="material-icon">picture_as_pdf</span>
                View Document
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Vote modal */}
      <GlassModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Your Vote">
        <p className="text-on-surface-variant text-sm mb-6">
          Are you sure you want to vote for <span className="text-on-surface font-semibold">"{title}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmOpen(false)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
            Cancel
          </button>
          <button onClick={handleVote} disabled={voting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:shadow-glow-primary disabled:opacity-50 transition-all duration-200">
            {voting ? 'Saving...' : 'Cast Vote'}
          </button>
        </div>
      </GlassModal>
    </div>
  );
}
