import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAutoSave } from '../../hooks/useAutoSave';
import ScoreInput from '../../components/ui/ScoreInput';
import RubricBar from '../../components/ui/RubricBar';
import AutoSaveIndicator from '../../components/ui/AutoSaveIndicator';
import api from '../../services/api';

const CRITERIA_BY_SEGMENT = {
  project: [
    { key: 'c1', label: 'Innovative Idea & Value Proposition',       desc: 'Originality of the concept and the value it delivers' },
    { key: 'c2', label: 'Market Need & Target Audience',             desc: 'Evidence of real demand and a clearly defined audience' },
    { key: 'c3', label: 'Technology Fit & Feasibility',              desc: 'Appropriateness of the tech stack and practicality of execution' },
    { key: 'c4', label: 'Business Model & Financial Viability',      desc: 'Cost structure and revenue model' },
    { key: 'c5', label: 'Scalability & Presentation Quality',        desc: 'Growth potential and overall delivery of the pitch' },
  ],
  ted_talk: [
    { key: 'c1', label: 'Clarity of Idea & Key Message',             desc: 'How clearly the central idea comes through' },
    { key: 'c2', label: 'Organization & Logical Flow',               desc: 'Structure and progression of the talk' },
    { key: 'c3', label: 'Audience Engagement & Online Presence',     desc: 'Ability to hold attention in a filmed/online format' },
    { key: 'c4', label: 'Delivery',                                  desc: 'Tone of voice, confidence, and body language — factoring in that the talk is filmed, not in person' },
    { key: 'c5', label: 'Originality & Overall Impact',              desc: 'Freshness of perspective and takeaway value' },
  ],
  interview: [
    { key: 'c1', label: 'Relevance & Quality of Answers',            desc: 'Substance and directness of responses' },
    { key: 'c2', label: 'Clarity & Professionalism in Communication',desc: 'Articulation and professional tone' },
    { key: 'c3', label: 'Online Presence & Interview Etiquette',     desc: 'Framing, eye contact, timing, and conduct on camera' },
    { key: 'c4', label: 'Confidence & Attentiveness',                desc: 'Composure and active engagement throughout' },
    { key: 'c5', label: 'Overall Fit, Critical Thinking & Impression',desc: 'General readiness and quality of reasoning' },
  ],
};

const QUICK_TAGS = ['Strong Research', 'Innovative Approach', 'Excellent Delivery', 'Good Flow', 'Technical Depth', 'Clear Vision', 'Strong Teamwork'];

function getEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return url;
}

function ProjectPosterPreview({ imageUrl, title, documentUrl }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-white border border-outline-variant shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-icon text-base text-on-surface-variant">image</span>
          <span className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Project Poster</span>
        </div>
        <span className="material-icon text-base text-on-surface-variant">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="border-t border-outline-variant">
          <img src={imageUrl} alt={title} className="w-full object-contain max-h-72 bg-surface-container" />
          {documentUrl && (
            <a href={documentUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-label text-on-surface-variant hover:text-on-surface border-t border-outline-variant transition-colors">
              <span className="material-icon text-sm">picture_as_pdf</span>
              View full PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function VideoPreview({ videoUrl, title, speaker }) {
  const [open, setOpen] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);
  return (
    <>
      <div className="rounded-2xl bg-white border border-outline-variant shadow-card overflow-hidden">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-icon text-base text-on-surface-variant">play_circle</span>
            <span className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">Watch TED Talk</span>
          </div>
          <span className="material-icon text-base text-on-surface-variant">open_in_new</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 border-b border-outline-variant">
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">TED Talk</p>
                <h3 className="font-headline font-bold text-on-surface text-base">{title}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{speaker}</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">
                <span className="material-icon">close</span>
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe src={embedUrl} title={title} allow="autoplay; fullscreen" allowFullScreen
                className="absolute inset-0 w-full h-full border-0" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function GradingInterface() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [scores, setScores]   = useState({ c1: null, c2: null, c3: null, c4: null, c5: null });
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const { saveStatus, lastSavedAt, saveNow } = useAutoSave(projectId, scores, feedback, !isSubmitted);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/grades/${projectId}`),
    ]).then(([projRes, gradeRes]) => {
      setProject(projRes.data);
      if (gradeRes.data) {
        const g = gradeRes.data;
        setScores(g.scores ?? { c1: null, c2: null, c3: null, c4: null, c5: null });
        setFeedback(g.feedback ?? '');
        setIsSubmitted(g.status === 'submitted');
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    const handler = () => { if (!isSubmitted) saveNow(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSubmitted, saveNow]);

  const totalScore = Object.values(scores).reduce((sum, v) => sum + (v ?? 0), 0);
  const allFilled  = Object.values(scores).every((v) => v !== null && v !== undefined);

  const handleSubmit = async () => {
    if (!allFilled) { setSubmitError('Please fill in all 5 scores before submitting.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post(`/grades/${projectId}/submit`, { scores, feedback });
      navigate('/judge/dashboard');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const appendTag = (tag) => {
    setFeedback((f) => f ? `${f} ${tag}.` : `${tag}.`);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white rounded-xl w-64 border border-outline-variant" />
        <div className="h-96 bg-white rounded-3xl border border-outline-variant" />
      </div>
    </div>
  );

  if (!project) return (
    <div className="text-center py-24 text-on-surface-variant">Project not found.</div>
  );

  const title = project.title;
  const segmentType = project.segmentType ?? 'project';
  const criteria = CRITERIA_BY_SEGMENT[segmentType] ?? CRITERIA_BY_SEGMENT.project;
  const SEGMENT_LABEL = { project: 'Project Pitch', ted_talk: 'TED-Style Talk', interview: 'Interview' };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <Link to="/judge/dashboard" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-3 transition-colors">
            <span className="material-icon text-base">arrow_back</span>
            Back to Dashboard
          </Link>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">{SEGMENT_LABEL[segmentType]}</p>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface">{title}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{project.projectNumber} · {project.category} · {project.teamName}</p>
        </div>
        <div className="flex items-center gap-3">
          {isSubmitted ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-xs font-label font-bold uppercase tracking-wider border border-secondary/30">
              <span className="material-icon text-sm material-icon-filled">check_circle</span>
              Submitted
            </span>
          ) : (
            <AutoSaveIndicator saveStatus={saveStatus} lastSavedAt={lastSavedAt} />
          )}
        </div>
      </div>

      {isSubmitted && (
        <div className="mb-6 p-4 rounded-xl bg-secondary/10 text-secondary text-sm font-label flex items-center gap-2 border border-secondary/20">
          <span className="material-icon text-base">lock</span>
          This evaluation has been submitted and is now read-only.
        </div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Rubric section */}
        <div className="lg:col-span-7 space-y-4">
          {criteria.map((c) => (
            <div key={c.key} className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-on-surface text-base">{c.label}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{c.desc}</p>
                </div>
                <ScoreInput
                  value={scores[c.key]}
                  onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
                  disabled={isSubmitted}
                />
              </div>
              <RubricBar score={scores[c.key]} />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-4">

          {/* Project preview */}
          {segmentType === 'project' && project.imageUrl && (
            <ProjectPosterPreview imageUrl={project.imageUrl} title={project.title} documentUrl={project.documentUrl} />
          )}
          {segmentType === 'ted_talk' && project.videoUrl && (
            <VideoPreview videoUrl={project.videoUrl} title={project.title} speaker={project.teamName} />
          )}

          {/* Running total */}
          <div className="p-6 rounded-3xl bg-primary border border-primary shadow-card">
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-primary/60 mb-3">Total Score</p>
            <div className="flex items-end gap-1">
              <span className="font-headline font-extrabold text-5xl text-on-primary">{totalScore}</span>
              <span className="text-on-primary/60 text-xl mb-1.5">/ 25</span>
            </div>
            <div className="mt-4 w-full h-2 rounded-full bg-on-primary/20">
              <div
                className="h-full rounded-full bg-on-primary transition-all duration-500"
                style={{ width: `${(totalScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Feedback */}
          <div className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">Feedback</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitted}
              placeholder="Share your thoughts on this presentation..."
              rows={6}
              className="w-full rounded-xl bg-surface-container text-on-surface placeholder-on-surface-variant text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-on-surface transition-all duration-200 border border-outline-variant disabled:opacity-50"
            />

            {/* Quick tags */}
            {!isSubmitted && (
              <div className="mt-3">
                <p className="text-xs text-on-surface-variant mb-2">Quick tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => appendTag(tag)}
                      className="px-2.5 py-1 rounded-full text-xs font-label bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Documentation link */}
          {project.documentUrl && (
            <div className="p-4 rounded-2xl bg-white flex items-center justify-between border border-outline-variant shadow-card">
              <div className="flex items-center gap-3">
                <span className="material-icon text-on-surface-variant">picture_as_pdf</span>
                <div>
                  <p className="text-xs font-label font-semibold text-on-surface">Documentation</p>
                  <p className="text-xs text-on-surface-variant">{project.projectNumber}</p>
                </div>
              </div>
              <a href={project.documentUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs font-label font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
                Download →
              </a>
            </div>
          )}

          {/* Actions */}
          {!isSubmitted && (
            <div className="space-y-3">
              {submitError && (
                <p className="text-sm text-error bg-error-container rounded-xl px-4 py-3">{submitError}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting || !allFilled}
                className="w-full h-14 rounded-xl bg-primary text-on-primary font-headline font-bold hover:bg-primary-fixed disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
              >
                {submitting ? (
                  <span className="material-icon animate-spin">progress_activity</span>
                ) : 'Submit Evaluation'}
              </button>
              <button
                onClick={saveNow}
                disabled={saveStatus === 'saving'}
                className="w-full py-3 rounded-xl bg-surface-container text-on-surface-variant font-label font-semibold text-sm hover:text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant"
              >
                Save Draft
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
