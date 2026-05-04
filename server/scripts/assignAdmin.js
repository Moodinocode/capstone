// One-off: give the existing admin user the same grading assignments
// as the regular judges, without wiping any votes/grades you already
// created. Safe to run multiple times — duplicates are filtered out.
import 'dotenv/config';
import supabase from '../config/supabase.js';

const FEATURED = ['P-103','P-104','P-107','P-108','P-116','P-117','P-121','P-123','P-124'];

const { data: admin } = await supabase
  .from('judges')
  .select('id, email')
  .eq('is_admin', true)
  .limit(1)
  .single();

if (!admin) {
  console.error('no admin user found — run npm run seed first');
  process.exit(1);
}

const { data: projects } = await supabase
  .from('projects')
  .select('id, project_number, segment_type');

const targetIds = (projects ?? [])
  .filter((p) => p.segment_type !== 'project' || FEATURED.includes(p.project_number))
  .map((p) => p.id);

const { data: existing } = await supabase
  .from('judge_projects')
  .select('project_id')
  .eq('judge_id', admin.id);

const existingSet = new Set((existing ?? []).map((r) => r.project_id));
const rows = targetIds
  .filter((id) => !existingSet.has(id))
  .map((project_id) => ({ judge_id: admin.id, project_id }));

if (!rows.length) {
  console.log(`admin ${admin.email} already has all ${targetIds.length} assignments`);
  process.exit(0);
}

const { error } = await supabase.from('judge_projects').insert(rows);
if (error) {
  console.error('insert failed:', error.message);
  process.exit(1);
}
console.log(`granted admin (${admin.email}) ${rows.length} new assignments`);
process.exit(0);
