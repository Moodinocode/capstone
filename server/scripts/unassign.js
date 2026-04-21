import 'dotenv/config';
import supabase from '../config/supabase.js';

// Usage: node scripts/unassign.js P-103 T-101 I-302
const projectNumbers = process.argv.slice(2);

if (!projectNumbers.length) {
  console.error('Usage: node scripts/unassign.js P-103 T-101 I-302 ...');
  process.exit(1);
}

async function unassign() {
  console.log(`→ Looking up: ${projectNumbers.join(', ')}`);

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, project_number, title')
    .in('project_number', projectNumbers);

  if (error) { console.error('Error:', error.message); process.exit(1); }

  const found = projects?.map(p => p.project_number) ?? [];
  const notFound = projectNumbers.filter(n => !found.includes(n));
  if (notFound.length) console.warn(`⚠️  Not found in DB: ${notFound.join(', ')}`);
  if (!projects?.length) { console.log('Nothing to unassign.'); process.exit(0); }

  const ids = projects.map(p => p.id);

  console.log('→ Removing from judge_projects…');
  await supabase.from('judge_projects').delete().in('project_id', ids);

  console.log('→ Removing any saved grades…');
  await supabase.from('grades').delete().in('project_id', ids);

  console.log('\n✅ Done. Removed from grading:');
  projects.forEach(p => console.log(`   ${p.project_number} — ${p.title}`));
}

unassign().catch(err => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
