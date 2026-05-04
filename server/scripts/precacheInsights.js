import 'dotenv/config';
import supabase from '../config/supabase.js';
import { generateInsights, aiConfig } from '../services/claude.js';

const FEATURED = ['P-103','P-104','P-107','P-108','P-116','P-117','P-121','P-123','P-124'];

const { data } = await supabase
  .from('projects')
  .select('id, project_number, title, team_name, category, description, tags, segment_type')
  .in('project_number', FEATURED);

if (!data?.length) {
  console.log('no featured projects found — did you seed?');
  process.exit(0);
}

for (const p of data) {
  try {
    const ins = await generateInsights({
      title: p.title,
      teamName: p.team_name,
      category: p.category,
      description: p.description,
      tags: p.tags ?? [],
      segmentType: p.segment_type ?? 'project',
    });
    await supabase.from('ai_insights').upsert(
      {
        project_id: p.id,
        model: aiConfig.MODEL,
        payload: ins,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' },
    );
    console.log('  ✓', p.project_number, '—', p.title);
  } catch (err) {
    console.error('  ✗', p.project_number, err.message);
  }
}

console.log('done');
process.exit(0);
