import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useLiveSession } from '../../context/LiveSessionContext';
import api from '../../services/api';

function ToggleRow({ label, sublabel, value, onToggle, busy }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/60 last:border-0">
      <div>
        <p className="font-headline font-bold text-on-surface text-sm">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{sublabel}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={busy}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          value ? 'bg-secondary' : 'bg-surface-container-highest'
        } disabled:opacity-50`}
        aria-pressed={value}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function SessionControls() {
  const { isPublic, voteCountVisible, isEventLive, refetch } = useLiveSession();
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState('');

  const post = async (path, body, key) => {
    setBusy(key); setErr('');
    try {
      await api.post(path, body);
      refetch();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const put = async (body, key) => {
    setBusy(key); setErr('');
    try {
      await api.put('/session', body);
      refetch();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-headline font-bold text-on-surface text-base">Live event controls</h2>
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
          updates push to every connected client
        </span>
      </div>
      <ToggleRow
        label="Event public"
        sublabel="When OFF, public visitors see &lsquo;Coming Soon&rsquo;."
        value={!!isPublic}
        onToggle={() => post('/session/set-public', { public: !isPublic }, 'pub')}
        busy={busy === 'pub'}
      />
      <ToggleRow
        label="Show vote counts"
        sublabel="When OFF, public sees projects without numeric vote counts."
        value={!!voteCountVisible}
        onToggle={() => post('/session/votes-visible', { visible: !voteCountVisible }, 'vc')}
        busy={busy === 'vc'}
      />
      <ToggleRow
        label="Event live"
        sublabel="Master switch for &lsquo;LIVE&rsquo; banners and the now-playing strip."
        value={!!isEventLive}
        onToggle={() => put({ isEventLive: !isEventLive }, 'live')}
        busy={busy === 'live'}
      />
      {err && <p className="text-xs text-error mt-2">{err}</p>}
    </div>
  );
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="p-5 rounded-3xl bg-white border border-outline-variant shadow-card">
      <p className="text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
      <p className="font-headline font-extrabold text-3xl text-on-surface">{value}</p>
      {sublabel && <p className="text-xs text-on-surface-variant mt-1">{sublabel}</p>}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { judge, loading: authLoading } = useAuth();
  const [stats, setStats]               = useState(null);
  const [series, setSeries]             = useState([]);
  const [judgeProgress, setJudgeProgress] = useState([]);
  const [interRater, setInterRater]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (authLoading || !judge?.isAdmin) return;
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/votes-timeseries?windowMin=60'),
      api.get('/admin/judge-progress'),
      api.get('/admin/inter-rater'),
    ]).then(([s, t, jp, ir]) => {
      setStats(s.data);
      setSeries(t.data.buckets.map((b) => ({ minute: b.minute, count: b.count })));
      setJudgeProgress(jp.data.rows);
      setInterRater(ir.data.rows.slice(0, 10));
    }).finally(() => setLoading(false));
  }, [authLoading, judge]);

  if (authLoading) return null;
  if (!judge) return <div className="p-12 text-center text-on-surface-variant">Sign in as a judge to view this page.</div>;
  if (!judge.isAdmin) return <div className="p-12 text-center text-on-surface-variant">Admin access required.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">Admin</p>
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface">Analytics</h1>
          <p className="text-on-surface-variant text-sm mt-1">Live event metrics and judge progress.</p>
        </div>
        <Link to="/admin/integrity" className="text-sm font-label font-semibold text-primary hover:underline">
          Integrity dashboard →
        </Link>
      </div>

      <SessionControls />

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && stats && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total votes"       value={stats.totalVotes}      sublabel={`${stats.uniqueVoters} unique browsers`} />
            <StatCard label="Submitted grades"  value={stats.submittedGrades} sublabel={`of ${stats.totalGrades} drafts`} />
            <StatCard label="Projects"          value={stats.totalProjects} />
            <StatCard label="Judges"            value={stats.totalJudges} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
              <h2 className="font-headline font-bold text-on-surface text-base mb-4">Votes per minute (last hour)</h2>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1f2937" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#1f2937" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="minute" tickFormatter={(m) => `-${60 - m}m`} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#111827" strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
              <h2 className="font-headline font-bold text-on-surface text-base mb-4">Cache hit rate</h2>
              <p className="font-headline font-extrabold text-5xl text-on-surface">
                {(stats.cacheStats.hitRate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-on-surface-variant mt-2">
                {stats.cacheStats.hits} hits / {stats.cacheStats.misses} misses · {stats.cacheStats.size} entries
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
              <h2 className="font-headline font-bold text-on-surface text-base mb-4">Judge progress</h2>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={judgeProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="submitted"  stackId="a" fill="#16a34a" />
                    <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="assigned"   stackId="a" fill="#cbd5e1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-on-surface-variant mt-3">Green = submitted · Amber = in progress · Grey = assigned & untouched</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-outline-variant shadow-card">
              <h2 className="font-headline font-bold text-on-surface text-base mb-4">Inter-rater reliability</h2>
              <p className="text-xs text-on-surface-variant mb-3">
                Highest standard deviation = most controversial. n is the number of judges who graded.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                      <th className="py-2 pr-3">Project</th>
                      <th className="py-2 pr-3">n</th>
                      <th className="py-2 pr-3">Mean</th>
                      <th className="py-2 pr-3">σ</th>
                      <th className="py-2">Spread</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interRater.map((r) => (
                      <tr key={r.projectId} className="border-b border-outline-variant/60">
                        <td className="py-2 pr-3 text-on-surface">{r.projectNumber} · {r.title}</td>
                        <td className="py-2 pr-3 text-on-surface-variant">{r.n}</td>
                        <td className="py-2 pr-3 text-on-surface-variant">{r.mean}</td>
                        <td className="py-2 pr-3 text-on-surface font-semibold">{r.stddev}</td>
                        <td className="py-2 text-on-surface-variant">{r.spread}</td>
                      </tr>
                    ))}
                    {interRater.length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-center text-on-surface-variant text-xs">No projects with 2+ submitted grades yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
