import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SEVERITY_COLOR = {
  low:    'bg-amber-100 text-amber-800 border-amber-300',
  medium: 'bg-orange-100 text-orange-800 border-orange-300',
  high:   'bg-red-100 text-red-800 border-red-300',
};

function pretty(d) {
  try { return new Date(d).toLocaleString(); } catch { return d; }
}

export default function IntegrityDashboard() {
  const { judge, loading: authLoading } = useAuth();
  const [anomalies, setAnomalies] = useState([]);
  const [auditLog, setAuditLog]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (authLoading || !judge?.isAdmin) return;
    Promise.all([
      api.get('/admin/anomalies?limit=100'),
      api.get('/admin/audit-log?limit=50'),
    ]).then(([a, l]) => {
      setAnomalies(a.data.rows);
      setAuditLog(l.data.rows);
    }).finally(() => setLoading(false));
  }, [authLoading, judge]);

  if (authLoading) return null;
  if (!judge) return <div className="p-12 text-center text-on-surface-variant">Sign in as a judge to view this page.</div>;
  if (!judge.isAdmin) return <div className="p-12 text-center text-on-surface-variant">Admin access required.</div>;

  const totals = anomalies.reduce(
    (acc, r) => { acc[r.severity] = (acc[r.severity] ?? 0) + 1; return acc; },
    { low: 0, medium: 0, high: 0 },
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">Admin</p>
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">Integrity</h1>
          <p className="text-on-surface-variant text-sm mt-1">Anomalous votes and the privileged-action audit trail.</p>
        </div>
        <Link to="/admin/analytics" className="text-sm font-label font-semibold text-primary hover:underline">
          ← Analytics dashboard
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-white border border-outline-variant shadow-card">
          <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">Low severity</p>
          <p className="font-headline font-extrabold text-3xl text-on-surface">{totals.low}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-outline-variant shadow-card">
          <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">Medium severity</p>
          <p className="font-headline font-extrabold text-3xl text-on-surface">{totals.medium}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-outline-variant shadow-card">
          <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">High severity</p>
          <p className="font-headline font-extrabold text-3xl text-on-surface">{totals.high}</p>
          <p className="text-xs text-on-surface-variant mt-1">3+ on a single project taints the People's Choice.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
          <h2 className="font-headline font-bold text-on-surface text-base mb-4">Flagged votes</h2>
          {loading ? <p className="text-sm text-on-surface-variant">Loading…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Project</th>
                    <th className="py-2 pr-3">Severity</th>
                    <th className="py-2 pr-3">Score</th>
                    <th className="py-2">Reasons</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((r) => (
                    <tr key={r.id} className="border-b border-outline-variant/60 align-top">
                      <td className="py-2 pr-3 text-on-surface-variant whitespace-nowrap">{pretty(r.createdAt)}</td>
                      <td className="py-2 pr-3 text-on-surface">{r.projectNumber} · {r.projectTitle}</td>
                      <td className="py-2 pr-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-label border ${SEVERITY_COLOR[r.severity]}`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-on-surface font-semibold">{r.score}</td>
                      <td className="py-2 text-on-surface-variant text-xs">
                        {(r.reasons || []).join(' · ')}
                      </td>
                    </tr>
                  ))}
                  {anomalies.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center text-on-surface-variant text-xs">No anomalies recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
          <h2 className="font-headline font-bold text-on-surface text-base mb-4">Audit trail</h2>
          {loading ? <p className="text-sm text-on-surface-variant">Loading…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Actor</th>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((r) => (
                    <tr key={r.id} className="border-b border-outline-variant/60">
                      <td className="py-2 pr-3 text-on-surface-variant whitespace-nowrap">{pretty(r.createdAt)}</td>
                      <td className="py-2 pr-3 text-on-surface">{r.actorName ?? r.actorType}</td>
                      <td className="py-2 pr-3 text-on-surface font-mono text-xs">{r.action}</td>
                      <td className="py-2 text-on-surface-variant text-xs">
                        {r.targetType ? `${r.targetType}:${r.targetId}` : '—'}
                      </td>
                    </tr>
                  ))}
                  {auditLog.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-on-surface-variant text-xs">No actions logged yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
