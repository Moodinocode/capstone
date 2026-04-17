import 'dotenv/config';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';

// ─────────────────────────────────────────────
// Images
// ─────────────────────────────────────────────
const PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
  'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
];

// Portrait-style photos for human-fronted segments (TED talks, interviews)
const SPEAKER_IMAGES = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
];

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const projectsData = [
  { projectNumber: 'P-201', title: 'Autonomous Site Inspector',            teamName: 'Team Alpha',     category: 'Engineering',       description: 'A drone-based autonomous inspection system for construction sites that detects structural anomalies using computer vision and generates real-time safety reports.', members: [{ name: 'Nour Khalil', role: 'Lead Engineer' }, { name: 'Rami Saad', role: 'ML Developer' }, { name: 'Lana Hayek', role: 'UX Designer' }], tags: ['drone','computer vision','safety','construction'], zoomLink: 'https://lau.zoom.us/j/demo201' },
  { projectNumber: 'P-202', title: 'Solar-Pulse Drone',                    teamName: 'Team Helios',    category: 'Engineering',       description: 'A solar-powered delivery drone capable of continuous daylight operation, eliminating battery recharging downtime for last-mile logistics.', members: [{ name: 'Omar Frem', role: 'Aerospace Engineer' }, { name: 'Mia Sleiman', role: 'Electronics' }], tags: ['solar','drone','logistics','sustainability'], zoomLink: 'https://lau.zoom.us/j/demo202' },
  { projectNumber: 'P-203', title: 'Quantum Shielding Protocol',           teamName: 'Team CipherX',   category: 'Tech Innovation',   description: 'A post-quantum cryptography implementation for legacy banking infrastructure.', members: [{ name: 'Karim Abi Nader', role: 'Security Architect' }, { name: 'Sara Haddad', role: 'Backend Dev' }, { name: 'Joe Najm', role: 'Research' }], tags: ['security','quantum','cryptography','fintech'], zoomLink: 'https://lau.zoom.us/j/demo203', isLive: true },
  { projectNumber: 'P-204', title: 'ShieldGate AI',                        teamName: 'Team Firewall',  category: 'Tech Innovation',   description: 'An AI-powered network intrusion detection system that learns from traffic patterns.', members: [{ name: 'Lara Khoury', role: 'AI Engineer' }, { name: 'Fadi Rizk', role: 'Network Specialist' }], tags: ['AI','cybersecurity','intrusion detection'], zoomLink: 'https://lau.zoom.us/j/demo204' },
  { projectNumber: 'P-205', title: 'Civic Pulse Platform',                 teamName: 'Team Agora',     category: 'Social Impact',     description: 'A civic engagement platform connecting citizens with local government.', members: [{ name: 'Maya Saab', role: 'Product Manager' }, { name: 'Georges Frem', role: 'Full Stack' }, { name: 'Dana Hanna', role: 'UX' }], tags: ['civic tech','government','community','transparency'], zoomLink: 'https://lau.zoom.us/j/demo205' },
  { projectNumber: 'P-206', title: 'EcoFlow Solutions',                    teamName: 'Team GreenWave', category: 'Social Impact',     description: 'Smart water recycling units for Lebanese households.', members: [{ name: 'Elias Khoury', role: 'Environmental Eng.' }, { name: 'Rita Nassar', role: 'Hardware' }], tags: ['water','sustainability','environment','hardware'], zoomLink: 'https://lau.zoom.us/j/demo206' },
  { projectNumber: 'P-207', title: 'Eco-Supply Chain AI',                  teamName: 'Team LogiGreen', category: 'Business Strategy', description: 'An AI platform optimizing supply chain routes to minimize carbon emissions.', members: [{ name: 'Ali Hassan', role: 'Business Analyst' }, { name: 'Celine Abou', role: 'Data Scientist' }, { name: 'Mark Tawk', role: 'Developer' }], tags: ['supply chain','AI','sustainability','logistics'], zoomLink: 'https://lau.zoom.us/j/demo207' },
  { projectNumber: 'P-208', title: 'Negotiation Dynamics',                 teamName: 'Team Leverage',  category: 'Business Strategy', description: 'A simulation-based training platform using AI role-playing to develop negotiation skills.', members: [{ name: 'Joelle Abi', role: 'L&D Specialist' }, { name: 'Karl Salam', role: 'AI Developer' }], tags: ['training','soft skills','AI','simulation'], zoomLink: 'https://lau.zoom.us/j/demo208' },
  { projectNumber: 'P-209', title: 'Neural Canvas',                        teamName: 'Team Luminary',  category: 'Creative Arts',     description: 'An AI-assisted collaborative mural tool for public spaces.', members: [{ name: 'Nadine Ghanem', role: 'Creative Director' }, { name: 'Sami Fares', role: 'ML Artist' }], tags: ['generative art','AI','community','installation'], zoomLink: 'https://lau.zoom.us/j/demo209' },
  { projectNumber: 'P-210', title: 'Visual Storytelling for Public Policy', teamName: 'Team Narrative', category: 'Creative Arts',    description: 'A data visualization framework translating government policy into visual narratives.', members: [{ name: 'Tina Haddad', role: 'Motion Designer' }, { name: 'Bechara Rizk', role: 'Data Viz' }, { name: 'Lea Nader', role: 'Policy Research' }], tags: ['data visualization','policy','design','storytelling'], zoomLink: 'https://lau.zoom.us/j/demo210' },
  { projectNumber: 'P-211', title: 'BioSync Patch',                        teamName: 'Team VitalTech', category: 'Med-Tech',          description: 'A wearable biosensor patch for continuous monitoring of diabetic patients.', members: [{ name: 'Dr. Hassan Mourad', role: 'Biomedical Eng.' }, { name: 'Yara Nassar', role: 'Software' }], tags: ['wearable','diabetes','IoT','healthcare'], zoomLink: 'https://lau.zoom.us/j/demo211' },
  { projectNumber: 'P-212', title: 'AI-Driven Soft Skill Enhancement',     teamName: 'Team EduSpark',  category: 'Med-Tech',          description: 'An adaptive learning platform using NLP and speech analysis.', members: [{ name: 'Sandra Khoury', role: 'NLP Engineer' }, { name: 'Ziad Atallah', role: 'Product' }, { name: 'Maya Salem', role: 'UX Research' }], tags: ['NLP','education','soft skills','adaptive learning'], zoomLink: 'https://lau.zoom.us/j/demo212' },
];

const tedTalksData = [
  { projectNumber: 'T-101', title: 'The Power of Vulnerability in Leadership', teamName: 'Lina Mansour',   category: 'Leadership',     description: 'A talk exploring how embracing vulnerability can transform leadership styles and build stronger teams.', members: [{ name: 'Lina Mansour', role: 'Speaker' }], tags: ['leadership','soft skills','vulnerability'], zoomLink: 'https://lau.zoom.us/j/demo-t101', videoUrl: 'https://www.youtube.com/watch?v=iCvmsMzlF7o' },
  { projectNumber: 'T-102', title: 'Communicating Across Cultures',            teamName: 'Rami Aziz',       category: 'Communication', description: 'How cultural intelligence can help professionals navigate diverse work environments with empathy and clarity.',       members: [{ name: 'Rami Aziz',     role: 'Speaker' }], tags: ['culture','communication','diversity'],    zoomLink: 'https://lau.zoom.us/j/demo-t102', videoUrl: 'https://www.youtube.com/watch?v=LqoyylsP72c' },
  { projectNumber: 'T-103', title: 'Resilience: Bouncing Forward',             teamName: 'Dana Khoury',     category: 'Personal Growth', description: 'A personal journey through adversity and the frameworks that helped rebuild momentum.',                              members: [{ name: 'Dana Khoury',   role: 'Speaker' }], tags: ['resilience','growth','mindset'],          zoomLink: 'https://lau.zoom.us/j/demo-t103', videoUrl: 'https://www.youtube.com/watch?v=NWH8N-BvhAw' },
  { projectNumber: 'T-104', title: 'The Art of Active Listening',              teamName: 'Karim Nassar',    category: 'Communication', description: 'Why listening is the most underrated professional skill and how to develop it deliberately.',                         members: [{ name: 'Karim Nassar',  role: 'Speaker' }], tags: ['listening','communication','soft skills'],zoomLink: 'https://lau.zoom.us/j/demo-t104', videoUrl: 'https://www.youtube.com/watch?v=saXfavo1OQo' },
];

const interviewsData = [
  { projectNumber: 'I-301', title: 'Interview: Leading Through Uncertainty',   teamName: 'Sara Frem',         category: 'Leadership',          description: 'A candid interview on navigating organizational change, maintaining team morale, and making decisions with incomplete information.', members: [{ name: 'Sara Frem',          role: 'Interviewee' }], tags: ['leadership','uncertainty','decision-making'],  zoomLink: 'https://lau.zoom.us/j/demo-i301' },
  { projectNumber: 'I-302', title: 'Interview: Building Your Personal Brand',  teamName: 'Georges Abi Nader', category: 'Career Development',  description: 'How to craft an authentic professional identity and communicate your value in any room.',                                               members: [{ name: 'Georges Abi Nader',  role: 'Interviewee' }], tags: ['personal brand','career','networking'],        zoomLink: 'https://lau.zoom.us/j/demo-i302' },
  { projectNumber: 'I-303', title: 'Interview: Emotional Intelligence at Work', teamName: 'Nadia Saleh',      category: 'Personal Growth',     description: 'A deep dive into how emotional intelligence shapes workplace relationships and career trajectories.',                                   members: [{ name: 'Nadia Saleh',        role: 'Interviewee' }], tags: ['EQ','emotional intelligence','workplace'],     zoomLink: 'https://lau.zoom.us/j/demo-i303' },
];

const judgesData = [
  { name: 'Dr. Elias Khoury',   email: 'elias@lau.edu.lb', password: 'judge123', isAdmin: true  },
  { name: 'Prof. Maya Saab',    email: 'maya@lau.edu.lb',  password: 'judge123', isAdmin: false },
  { name: 'Dr. Omar Nassif',    email: 'omar@lau.edu.lb',  password: 'judge123', isAdmin: false },
  { name: 'Dr. Lara Haddad',    email: 'lara@lau.edu.lb',  password: 'judge123', isAdmin: false },
  { name: 'Prof. Karim Abikar', email: 'karim@lau.edu.lb', password: 'judge123', isAdmin: false },
];

// Schedule labels reference the actual seeded TED talks (T-101, T-103) so the
// homepage timeline and the Event Media section stay in sync.
const scheduleData = [
  { sort_order: 1,  time: '09:00', label: 'Opening Ceremony',                        type: 'Opening',    start_time: '09:00:00' },
  { sort_order: 2,  time: '09:30', label: 'TED Talk: The Power of Vulnerability',    type: 'TED Talk',   start_time: '09:30:00' },
  { sort_order: 3,  time: '09:50', label: 'Project Pitches P-201–203',               type: 'Pitch',      start_time: '09:50:00' },
  { sort_order: 4,  time: '10:35', label: 'Coffee Break',                            type: 'Break',      start_time: '10:35:00' },
  { sort_order: 5,  time: '10:45', label: 'Project Pitches P-204–206',               type: 'Pitch',      start_time: '10:45:00' },
  { sort_order: 6,  time: '11:30', label: 'TED Talk: Resilience — Bouncing Forward', type: 'TED Talk',   start_time: '11:30:00' },
  { sort_order: 7,  time: '11:50', label: 'Project Pitches P-207–208',               type: 'Pitch',      start_time: '11:50:00' },
  { sort_order: 8,  time: '12:20', label: 'Lunch Break',                             type: 'Break',      start_time: '12:20:00' },
  { sort_order: 9,  time: '13:00', label: 'Project Pitches P-209–212',               type: 'Pitch',      start_time: '13:00:00' },
  { sort_order: 10, time: '14:00', label: 'Expo & Networking',                       type: 'Networking', start_time: '14:00:00' },
  { sort_order: 11, time: '14:30', label: 'Awards & Closing Ceremony',               type: 'Closing',    start_time: '14:30:00' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

const pick = (arr, i) => arr[i % arr.length];

const insertOrThrow = async (table, rows, label) => {
  const { data, error } = await supabase.from(table).insert(rows).select();
  if (error) throw new Error(`${label} — ${error.message}`);
  return data ?? [];
};

const clearAll = async () => {
  // Order matters: rows with FKs must go before their targets.
  await supabase.from('grades')         .delete().neq('id',       ZERO_UUID);
  await supabase.from('votes')          .delete().neq('id',       ZERO_UUID);
  await supabase.from('judge_projects') .delete().neq('judge_id', ZERO_UUID);
  await supabase.from('live_sessions')  .delete().neq('id',       ZERO_UUID);
  await supabase.from('schedule_items') .delete().neq('id',       ZERO_UUID);
  await supabase.from('judges')         .delete().neq('id',       ZERO_UUID);
  await supabase.from('projects')       .delete().neq('id',       ZERO_UUID);
};

const toProjectRow = (p, i, segmentType, imagePool) => ({
  project_number: p.projectNumber,
  title:          p.title,
  team_name:      p.teamName,
  category:       p.category,
  description:    p.description ?? '',
  members:        p.members ?? [],
  image_url:      pick(imagePool, i),
  video_url:      p.videoUrl ?? '',
  zoom_link:      p.zoomLink ?? '',
  is_live:        p.isLive ?? false,
  vote_count:     p.voteCount ?? 0,
  tags:           p.tags ?? [],
  segment_type:   segmentType,
  is_seeded:      true,
});

// Spread ~150 simulated votes across the 12 pitches so the leaderboard has a
// realistic ranking on first load. Deterministic — not random — so the seed
// output is reproducible.
const VOTE_DISTRIBUTION = [42, 31, 27, 19, 15, 12, 10, 8, 6, 4, 3, 2];

// Round-robin assignment: each judge gets ~5 consecutive pitches (with wraparound).
// Every judge also grades every TED talk and every interview.
const assignProjectsPerJudge = (judgeCount, projectCount, perJudge = 5) =>
  Array.from({ length: judgeCount }, (_, j) =>
    Array.from({ length: perJudge }, (_, k) => (j * 2 + k) % projectCount),
  );

// ─────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────
async function seed() {
  console.log('→ Clearing existing data…');
  await clearAll();

  console.log('→ Seeding project pitches…');
  const pitches = await insertOrThrow(
    'projects',
    projectsData.map((p, i) => ({
      ...toProjectRow(p, i, 'project', PROJECT_IMAGES),
      vote_count: VOTE_DISTRIBUTION[i] ?? 0,
    })),
    'Project pitches',
  );

  console.log('→ Seeding TED talks…');
  const tedTalks = await insertOrThrow(
    'projects',
    tedTalksData.map((p, i) => toProjectRow(p, i, 'ted_talk', SPEAKER_IMAGES)),
    'TED talks',
  );

  console.log('→ Seeding interviews…');
  const interviews = await insertOrThrow(
    'projects',
    interviewsData.map((p, i) => toProjectRow(p, i + 4, 'interview', SPEAKER_IMAGES)),
    'Interviews',
  );

  console.log('→ Seeding judges…');
  const judgeRows = await Promise.all(
    judgesData.map(async (j) => ({
      name:     j.name,
      email:    j.email,
      password: await bcrypt.hash(j.password, 10),
      is_admin: j.isAdmin,
    })),
  );
  const judges = await insertOrThrow('judges', judgeRows, 'Judges');

  console.log('→ Assigning segments to judges…');
  const pitchAssignments = assignProjectsPerJudge(judges.length, pitches.length);
  const assignmentRows = [];
  judges.forEach((judge, j) => {
    for (const idx of pitchAssignments[j]) {
      assignmentRows.push({ judge_id: judge.id, project_id: pitches[idx].id });
    }
    for (const t of tedTalks)    assignmentRows.push({ judge_id: judge.id, project_id: t.id });
    for (const iv of interviews) assignmentRows.push({ judge_id: judge.id, project_id: iv.id });
  });
  await insertOrThrow('judge_projects', assignmentRows, 'Judge assignments');

  console.log('→ Seeding demo grades…');
  const now = new Date().toISOString();
  await insertOrThrow('grades', [
    {
      judge_id:           judges[0].id,
      project_id:         pitches[0].id,
      score_c1:           8,
      score_c2:           9,
      score_c3:           7,
      score_c4:           8,
      score_c5:           9,
      total_score:        41,
      feedback:           'Exceptional use of computer vision. The live demo was compelling and the team handled Q&A with confidence.',
      status:             'submitted',
      last_saved_at:      now,
      submitted_at:       now,
    },
    {
      judge_id:           judges[0].id,
      project_id:         pitches[1].id,
      score_c1:           7,
      score_c2:           null,
      score_c3:           8,
      score_c4:           null,
      score_c5:           null,
      total_score:        15,
      feedback:           'Strong engineering fundamentals. Need to assess remaining criteria.',
      status:             'in_progress',
      last_saved_at:      now,
    },
    {
      judge_id:           judges[0].id,
      project_id:         tedTalks[0].id,
      score_c1:           9,
      score_c2:           9,
      score_c3:           10,
      score_c4:           8,
      score_c5:           9,
      total_score:        45,
      feedback:           'Deeply personal, well-paced, and anchored in real examples. A standout talk.',
      status:             'submitted',
      last_saved_at:      now,
      submitted_at:       now,
    },
  ], 'Demo grades');

  console.log('→ Seeding schedule…');
  await insertOrThrow('schedule_items', scheduleData, 'Schedule');

  console.log('→ Seeding live session…');
  const liveTed     = tedTalks[0];
  const upNextPitch = pitches[2]; // Quantum Shielding Protocol (P-203)
  await insertOrThrow('live_sessions', [{
    key:           'main',
    is_event_live: true,
    now_playing: {
      type:          'TED Talk',
      title:         liveTed.title,
      speakerOrTeam: liveTed.team_name,
      zoomLink:      liveTed.zoom_link,
      startedAt:     new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    up_next: {
      title:         `${upNextPitch.title} — Project Pitch`,
      speakerOrTeam: upNextPitch.team_name,
      startsAt:      new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    },
  }], 'Live session');

  console.log('\n✅ Seed complete!');
  console.log(`   ${pitches.length} project pitches (with vote counts)`);
  console.log(`   ${tedTalks.length} TED talks (with video URLs)`);
  console.log(`   ${interviews.length} interviews`);
  console.log(`   ${judges.length} judges (password: judge123)`);
  console.log(`   ${scheduleData.length} schedule items`);
  console.log('   Admin login: elias@lau.edu.lb / judge123');
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
