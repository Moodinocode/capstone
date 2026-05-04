import supabase from '../config/supabase.js';
import { cache } from '../utils/cache.js';

const SEGMENT_TYPES = ['project', 'ted_talk', 'interview'];

async function getTopByJudgeScore(segmentType) {
  const { data: grades } = await supabase
    .from('grades')
    .select('project_id, total_score, projects(id, project_number, title, team_name, category, image_url, segment_type, vote_count)')
    .eq('status', 'submitted')
    .eq('projects.segment_type', segmentType);

  if (!grades?.length) return { champions: [], honorableMentionExcludeIds: [] };

  const map = {};
  for (const g of grades) {
    if (!g.projects || g.projects.segment_type !== segmentType) continue;
    if (!map[g.project_id]) map[g.project_id] = { project: g.projects, scores: [] };
    map[g.project_id].scores.push(g.total_score ?? 0);
  }

  const ranked = Object.values(map)
    .map(({ project, scores }) => ({
      id: project.id,
      projectNumber: project.project_number,
      title: project.title,
      teamOrSpeaker: project.team_name,
      category: project.category,
      imageUrl: project.image_url ?? '',
      totalScore: parseFloat((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const champions = ranked.slice(0, 3).map((p, i) => ({ ...p, rank: i + 1 }));
  const honorableMentionExcludeIds = champions.map((c) => c.id);

  return { champions, honorableMentionExcludeIds };
}

async function getFanVoteLeader(segmentType, excludeIds, taintedIds) {
  const { data } = await supabase
    .from('projects')
    .select('id, project_number, title, team_name, category, image_url, vote_count')
    .eq('segment_type', segmentType)
    .order('vote_count', { ascending: false })
    .limit(excludeIds.length + taintedIds.length + 1);

  if (!data?.length) return null;

  const winner = data.find((p) => !excludeIds.includes(p.id) && !taintedIds.includes(p.id));
  if (!winner || !winner.vote_count) return null;

  return {
    id: winner.id,
    projectNumber: winner.project_number,
    title: winner.title,
    teamOrSpeaker: winner.team_name,
    category: winner.category,
    imageUrl: winner.image_url ?? '',
  };
}

async function getPeoplesChoice(taintedIds) {
  const { data } = await supabase
    .from('projects')
    .select('id, project_number, title, team_name, category, image_url, vote_count')
    .order('vote_count', { ascending: false })
    .limit(taintedIds.length + 1);

  if (!data?.length) return null;
  const clean = data.find((p) => !taintedIds.includes(p.id));
  if (!clean) return null;

  return {
    id: clean.id,
    projectNumber: clean.project_number,
    title: clean.title,
    teamOrSpeaker: clean.team_name,
    category: clean.category,
    imageUrl: clean.image_url ?? '',
    voteCount: clean.vote_count ?? 0,
  };
}

/**
 * Pull project_ids that exceeded the integrity threshold — these are
 * excluded from People's Choice and fan-vote honorable mentions to keep the
 * popular categories from being decided by a flagged burst.
 */
async function getTaintedProjectIds() {
  const { data } = await supabase
    .from('vote_flags')
    .select('project_id, severity');
  if (!data) return [];

  const counts = new Map();
  for (const r of data) {
    if (r.severity !== 'high') continue;
    counts.set(r.project_id, (counts.get(r.project_id) ?? 0) + 1);
  }
  // Tainted = 3+ high-severity flags on a single project.
  return [...counts.entries()].filter(([, n]) => n >= 3).map(([id]) => id);
}

export const getWinners = async (_req, res) => {
  const result = await cache.getOrSet('winners:all', 30_000, async () => {
    const taintedIds = await getTaintedProjectIds();

    const [pitchData, tedData, interviewData, peoplesChoice] = await Promise.all([
      getTopByJudgeScore('project'),
      getTopByJudgeScore('ted_talk'),
      getTopByJudgeScore('interview'),
      getPeoplesChoice(taintedIds),
    ]);

    const [pitchHM, tedHM, interviewHM] = await Promise.all([
      getFanVoteLeader('project',   pitchData.honorableMentionExcludeIds, taintedIds),
      getFanVoteLeader('ted_talk',  tedData.honorableMentionExcludeIds, taintedIds),
      getFanVoteLeader('interview', interviewData.honorableMentionExcludeIds, taintedIds),
    ]);

    return {
      pitches:    { champions: pitchData.champions,     honorableMentions: pitchHM     ? [pitchHM]     : [] },
      tedTalks:   { champions: tedData.champions,       honorableMentions: tedHM       ? [tedHM]       : [] },
      interviews: { champions: interviewData.champions, honorableMentions: interviewHM ? [interviewHM] : [] },
      peoplesChoice,
      taintedCount: taintedIds.length,
    };
  });

  res.json(result);
};

export { SEGMENT_TYPES };
