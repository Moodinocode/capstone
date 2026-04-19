import supabase from '../config/supabase.js';

const SEGMENT_TYPES = ['project', 'ted_talk', 'interview'];

async function getTopByJudgeScore(segmentType) {
  // Average total_score across all submitted grades per project, for this segment type
  const { data: grades } = await supabase
    .from('grades')
    .select('project_id, total_score, projects(id, project_number, title, team_name, category, image_url, segment_type, vote_count)')
    .eq('status', 'submitted')
    .eq('projects.segment_type', segmentType);

  if (!grades?.length) return { champions: [], honorableMentionExcludeIds: [] };

  // Group by project_id, compute avg
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

async function getFanVoteLeader(segmentType, excludeIds) {
  let query = supabase
    .from('projects')
    .select('id, project_number, title, team_name, category, image_url, vote_count')
    .eq('segment_type', segmentType)
    .order('vote_count', { ascending: false })
    .limit(excludeIds.length + 1);

  const { data } = await query;
  if (!data?.length) return null;

  const winner = data.find((p) => !excludeIds.includes(p.id));
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

async function getPeoplesChoice() {
  const { data } = await supabase
    .from('projects')
    .select('id, project_number, title, team_name, category, image_url, vote_count')
    .order('vote_count', { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    projectNumber: data.project_number,
    title: data.title,
    teamOrSpeaker: data.team_name,
    category: data.category,
    imageUrl: data.image_url ?? '',
    voteCount: data.vote_count ?? 0,
  };
}

export const getWinners = async (req, res) => {
  const [pitchData, tedData, interviewData, peoplesChoice] = await Promise.all([
    getTopByJudgeScore('project'),
    getTopByJudgeScore('ted_talk'),
    getTopByJudgeScore('interview'),
    getPeoplesChoice(),
  ]);

  const [pitchHM, tedHM, interviewHM] = await Promise.all([
    getFanVoteLeader('project',   pitchData.honorableMentionExcludeIds),
    getFanVoteLeader('ted_talk',  tedData.honorableMentionExcludeIds),
    getFanVoteLeader('interview', interviewData.honorableMentionExcludeIds),
  ]);

  res.json({
    pitches:    { champions: pitchData.champions,    honorableMentions: pitchHM    ? [pitchHM]    : [] },
    tedTalks:   { champions: tedData.champions,      honorableMentions: tedHM      ? [tedHM]      : [] },
    interviews: { champions: interviewData.champions, honorableMentions: interviewHM ? [interviewHM] : [] },
    peoplesChoice,
  });
};
