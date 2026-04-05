import supabase from '../config/supabase.js';

export const castVote = async (req, res) => {
  const { projectId, browserToken } = req.body;
  if (!projectId || !browserToken)
    return res.status(400).json({ message: 'projectId and browserToken required' });

  const { data: project } = await supabase
    .from('projects').select('id').eq('id', projectId).single();
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const { data: existing } = await supabase
    .from('votes').select('project_id').eq('browser_token', browserToken).single();
  if (existing)
    return res.status(409).json({ message: 'Already voted', votedProjectId: existing.project_id });

  await supabase.from('votes').insert({
    project_id: projectId,
    browser_token: browserToken,
    ip_address: req.ip ?? '',
  });

  await supabase.rpc('increment_vote_count', { p_id: projectId });

  res.status(201).json({ message: 'Vote recorded', projectId });
};

export const checkVote = async (req, res) => {
  const { data } = await supabase
    .from('votes').select('project_id').eq('browser_token', req.params.token).single();
  if (!data) return res.json({ voted: false, projectId: null });
  res.json({ voted: true, projectId: data.project_id });
};

export const getVoteCounts = async (req, res) => {
  const { data } = await supabase
    .from('projects')
    .select('id, title, vote_count')
    .order('vote_count', { ascending: false });

  res.json((data ?? []).map((p) => ({ projectId: p.id, title: p.title, count: p.vote_count })));
};
