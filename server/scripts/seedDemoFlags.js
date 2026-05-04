import 'dotenv/config';
import supabase from '../config/supabase.js';
import { randomUUID } from 'crypto';

const { data: projects } = await supabase
  .from('projects')
  .select('id, project_number, title')
  .eq('segment_type', 'project')
  .limit(2);

if (!projects?.length) {
  console.log('no projects — seed first');
  process.exit(0);
}

const rows = projects.map((p, i) => ({
  project_id: p.id,
  browser_token: randomUUID(),
  ip: `203.0.113.${40 + i}`,
  user_agent_hash: 'curl/8.4.0',
  score: 65 + i * 5,
  severity: 'high',
  reasons: [
    'burst:5 from same IP within 60s',
    'UA reused 7× in 5min',
    `${15 + i} votes from same IP in 5min`,
  ],
}));

const { error } = await supabase.from('vote_flags').insert(rows);
if (error) {
  console.error('insert failed:', error.message);
  process.exit(1);
}
console.log(`seeded ${rows.length} demo high-severity flags`);
process.exit(0);
