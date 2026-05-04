import { useEffect, useState } from 'react';
import api from '../../services/api';

/**
 * AI-generated advisory snapshot of a project. Shown to judges in the
 * grading interface and (in `compact` mode) to the public on the spotlight
 * page. The panel never *scores* — it's strictly a reading aid.
 */
export default function AiInsightsPanel({ projectId, compact = false, allowRefresh = false }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [open, setOpen]       = useState(!compact);

  const load = async (refresh = false) => {
    setLoading(true);
    setError('');
    try {
      const url = `/ai/insights/${projectId}${refresh ? '?refresh=1' : ''}`;
      const method = refresh ? 'post' : 'get';
      const res = await api[method](url);
      setData(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError(''); // silently hide for unauthenticated public spotlight pages
      } else {
        setError(err.response?.data?.message || 'Could not load insights.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (projectId) load(false); /* eslint-disable-line */ }, [projectId]);

  if (error) return null;

  return (
    <div className="rounded-3xl bg-white border border-outline-variant shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-icon text-base text-primary">auto_awesome</span>
          <span className="text-xs font-label font-bold text-on-surface uppercase tracking-widest">
            {compact ? 'Quick Read' : 'AI Insights'}
          </span>
          {data?._stub && (
            <span className="ml-2 text-[10px] uppercase tracking-widest text-on-surface-variant border border-outline-variant rounded-full px-2 py-0.5">
              offline mode
            </span>
          )}
        </div>
        <span className="material-icon text-base text-on-surface-variant">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-outline-variant">
          {loading && (
            <div className="py-4 text-xs text-on-surface-variant">Loading insights…</div>
          )}

          {!loading && data && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Summary</p>
                <p className="text-sm text-on-surface leading-relaxed">{data.summary}</p>
              </div>

              {Array.isArray(data.strengths) && data.strengths.length > 0 && (
                <div>
                  <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Apparent Strengths</p>
                  <ul className="space-y-1">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                        <span className="material-icon text-sm text-secondary mt-0.5">check_circle</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!compact && Array.isArray(data.questionsToAsk) && data.questionsToAsk.length > 0 && (
                <div>
                  <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Questions Worth Asking</p>
                  <ul className="space-y-1">
                    {data.questionsToAsk.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <span className="material-icon text-sm text-primary mt-0.5">help_outline</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!compact && data.rubricHints && (
                <div>
                  <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Rubric Hints</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {Object.entries(data.rubricHints).map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-surface-container px-3 py-2 border border-outline-variant">
                        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">{k}</p>
                        <p className="text-xs text-on-surface mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allowRefresh && (
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
                  <p className="text-[11px] text-on-surface-variant">
                    {data.cached ? 'Cached result' : 'Generated just now'}
                    {data.model ? ` · ${data.model}` : ''}
                  </p>
                  <button
                    onClick={() => load(true)}
                    className="text-xs font-label font-semibold text-primary hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
              )}

              <p className="text-[10px] text-on-surface-variant italic">
                Advisory only — judges set the score.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
