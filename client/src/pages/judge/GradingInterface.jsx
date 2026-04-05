import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import ScoreInput from '../../components/ui/ScoreInput';
import RubricBar from '../../components/ui/RubricBar';
import AutoSaveIndicator from '../../components/ui/AutoSaveIndicator';
import api from '../../services/api';

const CRITERIA = [
  { key: 'innovation',   labelKey: 'grade.innovation',   descKey: 'grade.innovationDesc' },
  { key: 'softSkills',   labelKey: 'grade.softSkills',   descKey: 'grade.softSkillsDesc' },
  { key: 'presentation', labelKey: 'grade.presentation', descKey: 'grade.presentationDesc' },
  { key: 'viability',    labelKey: 'grade.viability',    descKey: 'grade.viabilityDesc' },
];

const QUICK_TAGS = ['Strong Research', 'Innovative Approach', 'Excellent Delivery', 'Good Flow', 'Technical Depth', 'Clear Vision', 'Strong Teamwork'];

export default function GradingInterface() {
  const { projectId } = useParams();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [scores, setScores]   = useState({ innovation: null, softSkills: null, presentation: null, viability: null });
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const { saveStatus, lastSavedAt, saveNow } = useAutoSave(projectId, scores, feedback, !isSubmitted);

  // Load project + existing grade
  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/grades/${projectId}`),
    ]).then(([projRes, gradeRes]) => {
      setProject(projRes.data);
      if (gradeRes.data) {
        const g = gradeRes.data;
        setScores(g.scores ?? { innovation: null, softSkills: null, presentation: null, viability: null });
        setFeedback(g.feedback ?? '');
        setIsSubmitted(g.status === 'submitted');
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  // Save before page unload
  useEffect(() => {
    const handler = () => { if (!isSubmitted) saveNow(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSubmitted, saveNow]);

  const totalScore = Object.values(scores).reduce((sum, v) => sum + (v ?? 0), 0);
  const allFilled  = Object.values(scores).every((v) => v !== null && v !== undefined);

  const handleSubmit = async () => {
    if (!allFilled) { setSubmitError('Please fill in all 4 scores before submitting.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post(`/grades/${projectId}/submit`, { scores, feedback });
      navigate('/judge/dashboard');
    } catch (err) {
      setSubmitError(err.response?.data?.message || t('common.error'));
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
        <div className="h-8 bg-surface-container-high rounded-xl w-64" />
        <div className="h-96 bg-surface-container-high rounded-3xl" />
      </div>
    </div>
  );

  if (!project) return (
    <div className="text-center py-24 text-on-surface-variant">{t('common.error')}</div>
  );

  const title = lang === 'ar' && project.titleAr ? project.titleAr : project.title;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <Link to="/judge/dashboard" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-3 transition-colors">
            <span className="material-icon text-base">arrow_back</span>
            {t('grade.backToDash')}
          </Link>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface">{title}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{project.projectNumber} · {project.category} · {project.teamName}</p>
        </div>
        <div className="flex items-center gap-3">
          {isSubmitted ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-xs font-label font-bold uppercase tracking-wider">
              <span className="material-icon text-sm material-icon-filled">check_circle</span>
              {t('grade.submitted')}
            </span>
          ) : (
            <AutoSaveIndicator saveStatus={saveStatus} lastSavedAt={lastSavedAt} />
          )}
        </div>
      </div>

      {isSubmitted && (
        <div className="mb-6 p-4 rounded-xl bg-secondary/10 text-secondary text-sm font-label flex items-center gap-2">
          <span className="material-icon text-base">lock</span>
          {t('grade.submittedMsg')}
        </div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Rubric section */}
        <div className="lg:col-span-7 space-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key} className="p-6 rounded-3xl bg-surface-container-high">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-on-surface text-base">{t(c.labelKey)}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t(c.descKey)}</p>
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
          {/* Running total */}
          <div className="p-6 rounded-3xl bg-surface-container-high">
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">{t('grade.total')}</p>
            <div className="flex items-end gap-1">
              <span className="font-headline font-extrabold text-5xl text-on-surface">{totalScore}</span>
              <span className="text-on-surface-variant text-xl mb-1.5">/ 40</span>
            </div>
            <div className="mt-4 w-full h-2 rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(totalScore / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* Feedback */}
          <div className="p-6 rounded-3xl bg-surface-container-high">
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">{t('grade.feedback')}</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitted}
              placeholder={t('grade.feedbackPlaceholder')}
              rows={6}
              className="w-full rounded-xl bg-surface-container-highest text-on-surface placeholder-on-surface-variant text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 border-0 disabled:opacity-50"
            />

            {/* Quick tags */}
            {!isSubmitted && (
              <div className="mt-3">
                <p className="text-xs text-on-surface-variant mb-2">{t('grade.quickTags')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => appendTag(tag)}
                      className="px-2.5 py-1 rounded-full text-xs font-label bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/30 transition-colors"
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
            <div className="p-4 rounded-2xl bg-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-icon text-on-surface-variant">picture_as_pdf</span>
                <div>
                  <p className="text-xs font-label font-semibold text-on-surface">{t('grade.documentation')}</p>
                  <p className="text-xs text-on-surface-variant">{project.projectNumber}</p>
                </div>
              </div>
              <a href={project.documentUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs font-label font-semibold text-primary hover:text-primary-dim transition-colors">
                {t('grade.downloadDoc')} →
              </a>
            </div>
          )}

          {/* Actions */}
          {!isSubmitted && (
            <div className="space-y-3">
              {submitError && (
                <p className="text-sm text-error bg-error/10 rounded-xl px-4 py-3">{submitError}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting || !allFilled}
                className="w-full h-14 rounded-xl bg-primary text-on-primary font-headline font-bold hover:shadow-glow-primary disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
              >
                {submitting ? (
                  <span className="material-icon animate-spin">progress_activity</span>
                ) : t('grade.submit')}
              </button>
              <button
                onClick={saveNow}
                disabled={saveStatus === 'saving'}
                className="w-full py-3 rounded-xl bg-surface-container-highest text-on-surface-variant font-label font-semibold text-sm hover:text-on-surface transition-colors"
              >
                {t('grade.saveDraft')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
