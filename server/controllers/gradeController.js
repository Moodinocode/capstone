import supabase from '../config/supabase.js';

const shapeGrade = (row, projectRow = null) => ({
  _id: row.id,
  judge: row.judge_id,
  project: projectRow
    ? {
        _id: projectRow.id,
        projectNumber: projectRow.project_number,
        title: projectRow.title,
        teamName: projectRow.team_name,
        category: projectRow.category,
        imageUrl: projectRow.image_url,
        segmentType: projectRow.segment_type ?? 'project',
      }
    : row.project_id,
  scores: {
    c1: row.score_c1,
    c2: row.score_c2,
    c3: row.score_c3,
    c4: row.score_c4,
    c5: row.score_c5,
  },
  totalScore: row.total_score,
  feedback: row.feedback,
  status: row.status,
  lastSavedAt: row.last_saved_at,
  submittedAt: row.submitted_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getMyGrades = async (req, res) => {
  const judgeId = req.judge._id;

  const { data: grades } = await supabase
    .from('grades')
    .select('*, projects(id, project_number, title, team_name, category, image_url, segment_type)')
    .eq('judge_id', judgeId);

  const gradedProjectIds = new Set(grades?.map((g) => g.project_id) ?? []);

  const assignedProjects = req.judge.assignedProjects ?? [];
  const ungraded = assignedProjects
    .filter((pid) => !gradedProjectIds.has(pid))
    .map((pid) => ({ project: pid, status: 'not_started', scores: {}, totalScore: 0 }));

  res.json({
    grades: (grades ?? []).map((g) => shapeGrade(g, g.projects)),
    ungraded,
  });
};

export const getGradeForProject = async (req, res) => {
  const { data } = await supabase
    .from('grades')
    .select('*')
    .eq('judge_id', req.judge._id)
    .eq('project_id', req.params.projectId)
    .single();

  if (!data) return res.json(null);
  res.json(shapeGrade(data));
};

export const saveDraft = async (req, res) => {
  const { scores, feedback } = req.body;
  const projectId = req.params.projectId;

  const { data: project } = await supabase
    .from('projects').select('id').eq('id', projectId).single();
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const { data: existing } = await supabase
    .from('grades')
    .select('status')
    .eq('judge_id', req.judge._id)
    .eq('project_id', projectId)
    .single();

  if (existing?.status === 'submitted')
    return res.status(403).json({ message: 'Grade already submitted and locked' });

  const totalScore = Object.values(scores || {}).reduce((sum, v) => sum + (v ?? 0), 0);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('grades')
    .upsert(
      {
        judge_id: req.judge._id,
        project_id: projectId,
        score_c1: scores?.c1 ?? null,
        score_c2: scores?.c2 ?? null,
        score_c3: scores?.c3 ?? null,
        score_c4: scores?.c4 ?? null,
        score_c5: scores?.c5 ?? null,
        total_score: totalScore,
        feedback: feedback ?? '',
        status: 'in_progress',
        last_saved_at: now,
        updated_at: now,
      },
      { onConflict: 'judge_id,project_id' }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(shapeGrade(data));
};

export const submitGrade = async (req, res) => {
  const { scores, feedback } = req.body;
  const projectId = req.params.projectId;

  const { data: project } = await supabase
    .from('projects').select('id').eq('id', projectId).single();
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const { data: existing } = await supabase
    .from('grades')
    .select('status')
    .eq('judge_id', req.judge._id)
    .eq('project_id', projectId)
    .single();

  if (existing?.status === 'submitted')
    return res.status(403).json({ message: 'Grade already submitted' });

  const vals = Object.values(scores || {});
  if (vals.length < 5 || vals.some((v) => v === null || v === undefined))
    return res.status(400).json({ message: 'All 5 scores are required to submit' });

  const totalScore = vals.reduce((sum, v) => sum + v, 0);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('grades')
    .upsert(
      {
        judge_id: req.judge._id,
        project_id: projectId,
        score_c1: scores?.c1,
        score_c2: scores?.c2,
        score_c3: scores?.c3,
        score_c4: scores?.c4,
        score_c5: scores?.c5,
        total_score: totalScore,
        feedback: feedback ?? '',
        status: 'submitted',
        last_saved_at: now,
        submitted_at: now,
        updated_at: now,
      },
      { onConflict: 'judge_id,project_id' }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(shapeGrade(data));
};
