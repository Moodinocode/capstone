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
// ── poster images served from /public/projects/ ──────────────────────────────
// PDF-only entries have imageUrl: '' — fill in a real image URL before the event
// or replace with a screenshot of the PDF poster.
// teamName, category, description, members → fill in before the event.
// ─────────────────────────────────────────────────────────────────────────────
const projectsData = [
  { projectNumber: 'P-101', title: 'AFY Services',               teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/afy-services.png',        documentUrl: '/projects/afy-services.pdf' },
  { projectNumber: 'P-102', title: 'AI Voice Platform',          teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/ai-voice-platform.jpeg', documentUrl: '' },
  { projectNumber: 'P-103', title: 'Giftr App',                  teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/giftr-app.png',          documentUrl: '/projects/giftr-app.pdf' },
  { projectNumber: 'P-104', title: 'Sports Connect',             teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/sports-connect.jpeg',  documentUrl: '' },
  { projectNumber: 'P-105', title: 'Taxi Digital Advertising',   teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/taxi-digital-advertising.png', documentUrl: '/projects/taxi-digital-advertising.pdf' },
  { projectNumber: 'P-106', title: 'MentorMatch',                teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/mentormatch.png',        documentUrl: '/projects/mentormatch.pdf' },
  { projectNumber: 'P-107', title: 'Sofra',                      teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/sofra.png',            documentUrl: '' },
  { projectNumber: 'P-108', title: 'Etoile',                     teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/etoile.png',            documentUrl: '/projects/etoile.pdf' },
  { projectNumber: 'P-109', title: 'FixLink',                    teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/fixlink.png',          documentUrl: '' },
  { projectNumber: 'P-110', title: 'Fixongo',                    teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/fixongo.jpeg',         documentUrl: '' },
  { projectNumber: 'P-111', title: 'Handy',                      teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/handy.jpeg',           documentUrl: '' },
  { projectNumber: 'P-112', title: 'Kamelna',                    teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/kamelna.png',          documentUrl: '' },
  { projectNumber: 'P-113', title: 'LebPay',                     teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/lebpay.jpeg',          documentUrl: '' },
  { projectNumber: 'P-114', title: 'LebXplore',                  teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/lebxplore.jpeg',       documentUrl: '' },
  { projectNumber: 'P-115', title: 'Levant Coast Lines',          teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/levant-coast-lines.jpeg', documentUrl: '' },
  { projectNumber: 'P-116', title: 'Mouda',                      teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/mouda.jpeg',           documentUrl: '' },
  { projectNumber: 'P-117', title: 'OnBoard',                    teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/onboard.jpg',          documentUrl: '' },
  { projectNumber: 'P-118', title: 'PodLounge',                  teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/podlounge.jpeg',       documentUrl: '' },
  { projectNumber: 'P-119', title: 'Sensifist',                  teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/sensifist.jpeg',       documentUrl: '' },
  { projectNumber: 'P-120', title: 'Torquego Mobile Mechanics',  teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/torquego.jpeg',        documentUrl: '' },
  { projectNumber: 'P-121', title: 'Unitutor Lebanon',           teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/unitutor-lebanon.jpg', documentUrl: '' },
  { projectNumber: 'P-122', title: 'Your Gift Story',            teamName: '', category: 'Business Plan', description: '', members: [], tags: [], imageUrl: '/projects/your-gift-story.jpeg', documentUrl: '' },
];

const tedTalksData = [
  // ✅ REAL
  { projectNumber: 'T-101', title: 'A Crisis of Authenticity', teamName: 'Khaled Ghalayini', category: 'TED Talk', description: '', members: [{ name: 'Khaled Ghalayini', role: 'Speaker' }], tags: [], zoomLink: '', videoUrl: 'https://drive.google.com/file/d/1aRncNW5DCgxHqaHLJHSSOgsOU8fMbzjo/view?usp=sharing' },
  // ✅ REAL
  { projectNumber: 'T-102', title: 'Believe in God', teamName: 'Jad Chedid', category: 'TED Talk', description: '', members: [{ name: 'Jad Chedid', role: 'Speaker' }], tags: [], zoomLink: '', videoUrl: 'https://www.youtube.com/watch?v=XPe03ZWh0UY' },
  // ⏳ RESERVED — fill in speaker + video when received, shows "Coming Soon" if left empty
  { projectNumber: 'T-103', title: 'TED Talk', teamName: '', category: 'TED Talk', description: '', members: [], tags: [], zoomLink: '', videoUrl: '' },
  // ✅ REAL
  { projectNumber: 'T-104', title: 'Readyness', teamName: 'Adam', category: 'TED Talk', description: '', members: [{ name: 'Adam', role: 'Speaker' }], tags: [], zoomLink: '', videoUrl: 'https://drive.google.com/file/d/1c3pIOYEdhtiulv_9roiy7JsjWJ_g77gy/view?usp=sharing' },
  // ✅ REAL — first name unknown, update when confirmed
  { projectNumber: 'T-105', title: 'Enough for Everyone', teamName: 'Diab', category: 'TED Talk', description: 'The world produces enough food to feed everyone, yet millions go hungry. A look at the SDGs and the systemic gap between abundance and access.', members: [{ name: 'Diab', role: 'Speaker' }], tags: ['SDG','hunger','food','sustainability'], zoomLink: '', videoUrl: 'https://drive.google.com/file/d/1O5w3EOfiLbrnGIxYuTZGo9aU2Aje20hr/view?usp=sharing' },
];

const interviewsData = [
  { projectNumber: 'I-301', title: 'Interview: Leading Through Uncertainty',   teamName: 'Sara Frem',         category: 'Leadership',          description: 'A candid interview on navigating organizational change, maintaining team morale, and making decisions with incomplete information.', members: [{ name: 'Sara Frem',          role: 'Interviewee' }], tags: ['leadership','uncertainty','decision-making'],  zoomLink: 'https://lau.zoom.us/j/demo-i301' },
  { projectNumber: 'I-302', title: 'Interview: Building Your Personal Brand',  teamName: 'Georges Abi Nader', category: 'Career Development',  description: 'How to craft an authentic professional identity and communicate your value in any room.',                                               members: [{ name: 'Georges Abi Nader',  role: 'Interviewee' }], tags: ['personal brand','career','networking'],        zoomLink: 'https://lau.zoom.us/j/demo-i302' },
  { projectNumber: 'I-303', title: 'Interview: Emotional Intelligence at Work', teamName: 'Nadia Saleh',      category: 'Personal Growth',     description: 'A deep dive into how emotional intelligence shapes workplace relationships and career trajectories.',                                   members: [{ name: 'Nadia Saleh',        role: 'Interviewee' }], tags: ['EQ','emotional intelligence','workplace'],     zoomLink: 'https://lau.zoom.us/j/demo-i303' },
];

const judgesData = [
  { name: 'Emilie Wahab Harb',    email: 'emilie@softskills',     password: 'Emilie@SS25',    isAdmin: true  },
  { name: 'Ghassan Hammoud',      email: 'ghassan@softskills',    password: 'Ghassan@SS25',   isAdmin: false },
  { name: 'Marie Josee Daibes',   email: 'mariejosee@softskills', password: 'MJosee@SS25',    isAdmin: false },
  { name: 'Lilian Abou Hamdan',   email: 'lilian@softskills',     password: 'Lilian@SS25',    isAdmin: false },
  { name: 'Rita Nachar',          email: 'rita@softskills',       password: 'Rita@SS25',      isAdmin: false },
];

// Schedule labels reference the actual seeded TED talks (T-101, T-103) so the
// homepage timeline and the Event Media section stay in sync.
const scheduleData = [
  { sort_order: 1,  time: '14:00', label: 'Welcome — Dr. Maya',                                        type: 'Opening',    start_time: '14:00:00' },
  { sort_order: 2,  time: '14:03', label: 'Soft Skills Trailer',                                       type: 'Opening',    start_time: '14:03:00' },
  { sort_order: 3,  time: '14:08', label: 'Testimonial — Nour El Baba',                                type: 'Guest',      start_time: '14:08:00' },
  { sort_order: 4,  time: '14:13', label: 'Opening — Dr. Grace',                                       type: 'Opening',    start_time: '14:13:00' },
  { sort_order: 5,  time: '14:17', label: 'Introduction — Dr. Maya',                                   type: 'Remarks',    start_time: '14:17:00' },
  { sort_order: 6,  time: '14:20', label: 'Opening Remarks — Dean Jamali',                             type: 'Remarks',    start_time: '14:20:00' },
  { sort_order: 7,  time: '14:25', label: 'Panel Introduction — Dr. Maya & Emilie Wahab Harb',         type: 'Remarks',    start_time: '14:25:00' },
  { sort_order: 8,  time: '14:30', label: 'TED Talk — Emilie Wahab Harb',                              type: 'TED Talk',   start_time: '14:30:00' },
  { sort_order: 9,  time: '14:40', label: 'TED Talk — Lilian Abou Hamdan',                             type: 'TED Talk',   start_time: '14:40:00' },
  { sort_order: 10, time: '14:50', label: 'Mock Interviews — Lilian, Marie Josée & Rita',              type: 'Interview',  start_time: '14:50:00' },
  { sort_order: 11, time: '15:10', label: 'Business Plan Pitches — Mr. Hammoud',                       type: 'Pitch',      start_time: '15:10:00' },
  { sort_order: 12, time: '15:30', label: 'Closing Remarks & Results — Dr. Maya & Dean Jamali',        type: 'Closing',    start_time: '15:30:00' },
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
  image_url:      p.imageUrl !== undefined ? p.imageUrl : pick(imagePool, i),
  video_url:      p.videoUrl ?? '',
  document_url:   p.documentUrl ?? '',
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
const VOTE_DISTRIBUTION = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
  console.log(`   ${judges.length} judges seeded:`);
  judgesData.forEach((j) => console.log(`     ${j.email}  /  ${j.password}`));
  console.log(`   ${scheduleData.length} schedule items`);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
