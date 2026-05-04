import supabase from '../config/supabase.js';
import { cache } from '../utils/cache.js';

/**
 * GET /api/admin/stats — high-level event metrics.
 */
export const getStats = async (_req, res) => {
  const data = await cache.getOrSet('admin:stats', 10_000, async () => {
    const [{ count: totalVotes }, { count: uniqueVoters }, { count: totalGrades }, { count: submittedGrades }, { count: totalProjects }, { count: totalJudges }] = await Promise.all([
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('browser_token', { count: 'exact', head: true }),
      supabase.from('grades').select('*', { count: 'exact', head: true }),
      supabase.from('grades').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('judges').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalVotes: totalVotes ?? 0,
      uniqueVoters: uniqueVoters ?? 0,
      totalGrades: totalGrades ?? 0,
      submittedGrades: submittedGrades ?? 0,
      totalProjects: totalProjects ?? 0,
      totalJudges: totalJudges ?? 0,
      cacheStats: cache.stats(),
    };
  });

  res.json(data);
};

/**
 * GET /api/admin/votes-timeseries — votes/min for the last `windowMin` minutes.
 */
export const getVotesTimeseries = async (req, res) => {
  const windowMin = Math.min(Number(req.query.windowMin) || 60, 24 * 60);
  const since = new Date(Date.now() - windowMin * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('votes').select('created_at').gte('created_at', since);

  const buckets = new Array(windowMin).fill(0);
  const start = Date.now() - windowMin * 60 * 1000;
  for (const v of data ?? []) {
    const idx = Math.floor((new Date(v.created_at).getTime() - start) / 60_000);
    if (idx >= 0 && idx < windowMin) buckets[idx]++;
  }

  res.json({
    windowMin,
    buckets: buckets.map((count, i) => ({
      minute: i,
      count,
      timestamp: new Date(start + i * 60_000).toISOString(),
    })),
  });
};

/**
 * GET /api/admin/inter-rater — std-dev of judge total_score per project.
 * High std-dev means judges disagree → controversial entry.
 */
export const getInterRater = async (_req, res) => {
  const { data } = await supabase
    .from('grades')
    .select('project_id, total_score, projects(id, project_number, title, team_name, segment_type)')
    .eq('status', 'submitted');

  const groups = new Map();
  for (const g of data ?? []) {
    if (!g.projects) continue;
    if (!groups.has(g.project_id)) {
      groups.set(g.project_id, { project: g.projects, scores: [] });
    }
    groups.get(g.project_id).scores.push(g.total_score ?? 0);
  }

  const rows = [...groups.values()]
    .map(({ project, scores }) => {
      const n = scores.length;
      const mean = scores.reduce((s, v) => s + v, 0) / Math.max(n, 1);
      const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(n, 1);
      const stddev = Math.sqrt(variance);
      return {
        projectId: project.id,
        projectNumber: project.project_number,
        title: project.title,
        teamName: project.team_name,
        segmentType: project.segment_type,
        n,
        mean: +mean.toFixed(2),
        stddev: +stddev.toFixed(2),
        spread: +(Math.max(...scores) - Math.min(...scores)).toFixed(2),
      };
    })
    .filter((r) => r.n >= 2)
    .sort((a, b) => b.stddev - a.stddev);

  res.json({ rows });
};

/**
 * GET /api/admin/anomalies — flagged votes for the integrity dashboard.
 */
export const getAnomalies = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const { data, error } = await supabase
    .from('vote_flags')
    .select('*, projects(id, title, project_number)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ message: error.message });
  res.json({
    rows: (data ?? []).map((r) => ({
      id: r.id,
      projectId: r.project_id,
      projectTitle: r.projects?.title,
      projectNumber: r.projects?.project_number,
      browserToken: r.browser_token,
      ip: r.ip,
      score: r.score,
      severity: r.severity,
      reasons: r.reasons,
      createdAt: r.created_at,
    })),
  });
};

/**
 * GET /api/admin/audit-log — recent privileged actions.
 */
export const getAuditLog = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, judges:actor_id(name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return res.status(500).json({ message: error.message });
  res.json({
    rows: (data ?? []).map((r) => ({
      id: r.id,
      actorType: r.actor_type,
      actorId: r.actor_id,
      actorName: r.judges?.name,
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      metadata: r.metadata,
      ip: r.ip,
      createdAt: r.created_at,
    })),
  });
};

export const getJudgeProgress = async (_req, res) => {
  const { data: judges } = await supabase.from('judges').select('id, name, email');
  const { data: assignments } = await supabase.from('judge_projects').select('judge_id, project_id');
  const { data: grades } = await supabase.from('grades').select('judge_id, project_id, status');

  const byJudge = new Map();
  for (const j of judges ?? []) {
    byJudge.set(j.id, { judgeId: j.id, name: j.name, email: j.email, assigned: 0, inProgress: 0, submitted: 0 });
  }
  for (const a of assignments ?? []) {
    const row = byJudge.get(a.judge_id);
    if (row) row.assigned++;
  }
  for (const g of grades ?? []) {
    const row = byJudge.get(g.judge_id);
    if (!row) continue;
    if (g.status === 'submitted') row.submitted++;
    else if (g.status === 'in_progress') row.inProgress++;
  }

  res.json({ rows: [...byJudge.values()] });
};
