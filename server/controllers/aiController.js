import supabase from '../config/supabase.js';
import { generateInsights, aiConfig } from '../services/claude.js';
import logger from '../utils/logger.js';

/**
 * GET / POST /api/ai/insights/:projectId
 * Returns cached row if present; otherwise generates, persists, and returns it.
 * Force regeneration with ?refresh=1 (admin only).
 */
export const getInsights = async (req, res) => {
  const projectId = req.params.projectId;
  const refresh = req.query.refresh === '1' && req.judge?.isAdmin;

  if (!refresh) {
    const { data: cached } = await supabase
      .from('ai_insights').select('*').eq('project_id', projectId).single();
    if (cached) {
      return res.json({
        projectId,
        cached: true,
        model: cached.model,
        ...cached.payload,
        generatedAt: cached.created_at,
      });
    }
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, title, team_name, category, description, tags, segment_type')
    .eq('id', projectId)
    .single();
  if (error || !project) return res.status(404).json({ message: 'Project not found' });

  const shaped = {
    title: project.title,
    teamName: project.team_name,
    category: project.category,
    description: project.description,
    tags: project.tags ?? [],
    segmentType: project.segment_type ?? 'project',
  };

  const insights = await generateInsights(shaped);

  const { error: upErr } = await supabase
    .from('ai_insights')
    .upsert(
      { project_id: projectId, model: aiConfig.MODEL, payload: insights, updated_at: new Date().toISOString() },
      { onConflict: 'project_id' },
    );
  if (upErr) logger.warn({ err: upErr.message }, 'ai_insights upsert failed');

  res.json({ projectId, cached: false, model: aiConfig.MODEL, ...insights });
};

export const aiHealth = (_req, res) => {
  res.json({ enabled: aiConfig.ENABLE_REAL, model: aiConfig.MODEL });
};
