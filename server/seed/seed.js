import 'dotenv/config';
import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';

const IMAGES = [
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

const projectsData = [
  { projectNumber: 'P-201', title: 'Autonomous Site Inspector', titleAr: 'مفتش المواقع الذاتي', teamName: 'Team Alpha', teamNameAr: 'فريق ألفا', category: 'Engineering', description: 'A drone-based autonomous inspection system for construction sites that detects structural anomalies using computer vision and generates real-time safety reports.', descriptionAr: 'نظام تفتيش ذاتي يعتمد على الطائرات المسيّرة لمواقع البناء، يكتشف الشذوذات الهيكلية باستخدام رؤية الحاسوب وينشئ تقارير سلامة فورية.', members: [{ name: 'Nour Khalil', role: 'Lead Engineer' }, { name: 'Rami Saad', role: 'ML Developer' }, { name: 'Lana Hayek', role: 'UX Designer' }], tags: ['drone', 'computer vision', 'safety', 'construction'], zoomLink: 'https://lau.zoom.us/j/demo201' },
  { projectNumber: 'P-202', title: 'Solar-Pulse Drone', titleAr: 'طائرة نبض الطاقة الشمسية', teamName: 'Team Helios', teamNameAr: 'فريق هيليوس', category: 'Engineering', description: 'A solar-powered delivery drone capable of continuous daylight operation, eliminating battery recharging downtime for last-mile logistics.', descriptionAr: 'طائرة توصيل تعمل بالطاقة الشمسية قادرة على العمل المستمر خلال ساعات النهار.', members: [{ name: 'Omar Frem', role: 'Aerospace Engineer' }, { name: 'Mia Sleiman', role: 'Electronics' }], tags: ['solar', 'drone', 'logistics', 'sustainability'], zoomLink: 'https://lau.zoom.us/j/demo202' },
  { projectNumber: 'P-203', title: 'Quantum Shielding Protocol', titleAr: 'بروتوكول الدرع الكمي', teamName: 'Team CipherX', teamNameAr: 'فريق سايفر-إكس', category: 'Tech Innovation', description: 'A post-quantum cryptography implementation for legacy banking infrastructure.', descriptionAr: 'تطبيق للتشفير ما بعد الكمي للبنية التحتية المصرفية القديمة.', members: [{ name: 'Karim Abi Nader', role: 'Security Architect' }, { name: 'Sara Haddad', role: 'Backend Dev' }, { name: 'Joe Najm', role: 'Research' }], tags: ['security', 'quantum', 'cryptography', 'fintech'], zoomLink: 'https://lau.zoom.us/j/demo203', isLive: true },
  { projectNumber: 'P-204', title: 'ShieldGate AI', titleAr: 'بوابة الدرع الذكي', teamName: 'Team Firewall', teamNameAr: 'فريق الجدار الناري', category: 'Tech Innovation', description: 'An AI-powered network intrusion detection system that learns from traffic patterns.', descriptionAr: 'نظام اكتشاف اختراق الشبكات المدعوم بالذكاء الاصطناعي.', members: [{ name: 'Lara Khoury', role: 'AI Engineer' }, { name: 'Fadi Rizk', role: 'Network Specialist' }], tags: ['AI', 'cybersecurity', 'intrusion detection'], zoomLink: 'https://lau.zoom.us/j/demo204' },
  { projectNumber: 'P-205', title: 'Civic Pulse Platform', titleAr: 'منصة النبض المدني', teamName: 'Team Agora', teamNameAr: 'فريق أغورا', category: 'Social Impact', description: 'A civic engagement platform connecting citizens with local government.', descriptionAr: 'منصة للمشاركة المدنية تربط المواطنين بالحكومة المحلية.', members: [{ name: 'Maya Saab', role: 'Product Manager' }, { name: 'Georges Frem', role: 'Full Stack' }, { name: 'Dana Hanna', role: 'UX' }], tags: ['civic tech', 'government', 'community', 'transparency'], zoomLink: 'https://lau.zoom.us/j/demo205' },
  { projectNumber: 'P-206', title: 'EcoFlow Solutions', titleAr: 'حلول إيكوفلو', teamName: 'Team GreenWave', teamNameAr: 'فريق الموجة الخضراء', category: 'Social Impact', description: 'Smart water recycling units for Lebanese households.', descriptionAr: 'وحدات ذكية لإعادة تدوير المياه للمنازل اللبنانية.', members: [{ name: 'Elias Khoury', role: 'Environmental Eng.' }, { name: 'Rita Nassar', role: 'Hardware' }], tags: ['water', 'sustainability', 'environment', 'hardware'], zoomLink: 'https://lau.zoom.us/j/demo206' },
  { projectNumber: 'P-207', title: 'Eco-Supply Chain AI', titleAr: 'سلسلة التوريد البيئية الذكية', teamName: 'Team LogiGreen', teamNameAr: 'فريق لوجي-غرين', category: 'Business Strategy', description: 'An AI platform optimizing supply chain routes to minimize carbon emissions.', descriptionAr: 'منصة ذكاء اصطناعي تحسّن مسارات سلسلة التوريد.', members: [{ name: 'Ali Hassan', role: 'Business Analyst' }, { name: 'Celine Abou', role: 'Data Scientist' }, { name: 'Mark Tawk', role: 'Developer' }], tags: ['supply chain', 'AI', 'sustainability', 'logistics'], zoomLink: 'https://lau.zoom.us/j/demo207' },
  { projectNumber: 'P-208', title: 'Negotiation Dynamics', titleAr: 'ديناميكيات التفاوض', teamName: 'Team Leverage', teamNameAr: 'فريق ليفرج', category: 'Business Strategy', description: 'A simulation-based training platform using AI role-playing to develop negotiation skills.', descriptionAr: 'منصة تدريب تعتمد على المحاكاة.', members: [{ name: 'Joelle Abi', role: 'L&D Specialist' }, { name: 'Karl Salam', role: 'AI Developer' }], tags: ['training', 'soft skills', 'AI', 'simulation'], zoomLink: 'https://lau.zoom.us/j/demo208' },
  { projectNumber: 'P-209', title: 'Neural Canvas', titleAr: 'القماش العصبي', teamName: 'Team Luminary', teamNameAr: 'فريق لومينري', category: 'Creative Arts', description: 'An AI-assisted collaborative mural tool for public spaces.', descriptionAr: 'أداة جدارية تعاونية مدعومة بالذكاء الاصطناعي.', members: [{ name: 'Nadine Ghanem', role: 'Creative Director' }, { name: 'Sami Fares', role: 'ML Artist' }], tags: ['generative art', 'AI', 'community', 'installation'], zoomLink: 'https://lau.zoom.us/j/demo209' },
  { projectNumber: 'P-210', title: 'Visual Storytelling for Public Policy', titleAr: 'السرد البصري للسياسة العامة', teamName: 'Team Narrative', teamNameAr: 'فريق ناراتيف', category: 'Creative Arts', description: 'A data visualization framework translating government policy into visual narratives.', descriptionAr: 'إطار تصور للبيانات يترجم وثائق السياسات الحكومية.', members: [{ name: 'Tina Haddad', role: 'Motion Designer' }, { name: 'Bechara Rizk', role: 'Data Viz' }, { name: 'Lea Nader', role: 'Policy Research' }], tags: ['data visualization', 'policy', 'design', 'storytelling'], zoomLink: 'https://lau.zoom.us/j/demo210' },
  { projectNumber: 'P-211', title: 'BioSync Patch', titleAr: 'رقعة بيوسينك', teamName: 'Team VitalTech', teamNameAr: 'فريق فيتال تك', category: 'Med-Tech', description: 'A wearable biosensor patch for continuous monitoring of diabetic patients.', descriptionAr: 'رقعة استشعار حيوي قابلة للارتداء لمراقبة مرضى السكري.', members: [{ name: 'Dr. Hassan Mourad', role: 'Biomedical Eng.' }, { name: 'Yara Nassar', role: 'Software' }], tags: ['wearable', 'diabetes', 'IoT', 'healthcare'], zoomLink: 'https://lau.zoom.us/j/demo211' },
  { projectNumber: 'P-212', title: 'AI-Driven Soft Skill Enhancement', titleAr: 'تعزيز المهارات الشخصية بالذكاء الاصطناعي', teamName: 'Team EduSpark', teamNameAr: 'فريق إيدو سبارك', category: 'Med-Tech', description: 'An adaptive learning platform using NLP and speech analysis.', descriptionAr: 'منصة تعلم تكيفية تستخدم معالجة اللغة الطبيعية.', members: [{ name: 'Sandra Khoury', role: 'NLP Engineer' }, { name: 'Ziad Atallah', role: 'Product' }, { name: 'Maya Salem', role: 'UX Research' }], tags: ['NLP', 'education', 'soft skills', 'adaptive learning'], zoomLink: 'https://lau.zoom.us/j/demo212' },
];

const judgesData = [
  { name: 'Dr. Elias Khoury',   nameAr: 'د. إلياس خوري',  email: 'elias@lau.edu.lb',  password: 'judge123', isAdmin: true },
  { name: 'Prof. Maya Saab',    nameAr: 'أ. مايا صعب',    email: 'maya@lau.edu.lb',   password: 'judge123', isAdmin: false },
  { name: 'Dr. Omar Nassif',    nameAr: 'د. عمر نصيف',    email: 'omar@lau.edu.lb',   password: 'judge123', isAdmin: false },
  { name: 'Dr. Lara Haddad',    nameAr: 'د. لارا حداد',   email: 'lara@lau.edu.lb',   password: 'judge123', isAdmin: false },
  { name: 'Prof. Karim Abikar', nameAr: 'أ. كريم أبيكار', email: 'karim@lau.edu.lb',  password: 'judge123', isAdmin: false },
];

async function seed() {
  console.log('Clearing existing data...');
  await supabase.from('grades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('judge_projects').delete().neq('judge_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('live_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('judges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Seeding projects...');
  const { data: createdProjects, error: projectError } = await supabase
    .from('projects')
    .insert(
      projectsData.map((p, i) => ({
        project_number: p.projectNumber,
        title: p.title,
        title_ar: p.titleAr ?? '',
        team_name: p.teamName,
        team_name_ar: p.teamNameAr ?? '',
        category: p.category,
        description: p.description ?? '',
        description_ar: p.descriptionAr ?? '',
        members: p.members ?? [],
        image_url: IMAGES[i % IMAGES.length],
        zoom_link: p.zoomLink ?? '',
        is_live: p.isLive ?? false,
        tags: p.tags ?? [],
      }))
    )
    .select();

  if (projectError) { console.error('Project seed error:', projectError); process.exit(1); }

  console.log('Seeding judges...');
  const judgeRows = [];
  for (const jd of judgesData) {
    const hashed = await bcrypt.hash(jd.password, 10);
    judgeRows.push({
      name: jd.name,
      name_ar: jd.nameAr,
      email: jd.email,
      password: hashed,
      is_admin: jd.isAdmin,
    });
  }
  const { data: createdJudges, error: judgeError } = await supabase
    .from('judges').insert(judgeRows).select();
  if (judgeError) { console.error('Judge seed error:', judgeError); process.exit(1); }

  console.log('Assigning projects to judges...');
  const assignments = [
    [0, 1, 2, 3, 4],
    [2, 3, 4, 5, 6],
    [4, 5, 6, 7, 8],
    [6, 7, 8, 9, 10],
    [8, 9, 10, 11, 0],
  ];
  const assignmentRows = [];
  for (let i = 0; i < createdJudges.length; i++) {
    for (const idx of assignments[i]) {
      assignmentRows.push({ judge_id: createdJudges[i].id, project_id: createdProjects[idx].id });
    }
  }
  await supabase.from('judge_projects').insert(assignmentRows);

  console.log('Seeding demo grades...');
  const now = new Date().toISOString();
  await supabase.from('grades').insert([
    {
      judge_id: createdJudges[0].id,
      project_id: createdProjects[0].id,
      score_innovation: 8, score_soft_skills: 9, score_presentation: 7, score_viability: 8,
      total_score: 32,
      feedback: 'Exceptional use of computer vision. The live demo was compelling and the team handled Q&A with confidence.',
      status: 'submitted',
      last_saved_at: now,
      submitted_at: now,
    },
    {
      judge_id: createdJudges[0].id,
      project_id: createdProjects[1].id,
      score_innovation: 7, score_soft_skills: null, score_presentation: 8, score_viability: null,
      total_score: 15,
      feedback: 'Strong engineering fundamentals. Need to assess soft skills and viability further.',
      status: 'in_progress',
      last_saved_at: now,
    },
  ]);

  console.log('Seeding live session...');
  await supabase.from('live_sessions').insert({
    key: 'main',
    is_event_live: true,
    now_playing: {
      type: 'TED Talk',
      title: 'Mastering Emotional Intelligence in the Workplace',
      titleAr: 'إتقان الذكاء العاطفي في بيئة العمل',
      speakerOrTeam: 'Sarah Khalil',
      zoomLink: 'https://lau.zoom.us/j/demo-main',
      startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    up_next: {
      title: 'Quantum Shielding Protocol — Project Pitch',
      titleAr: 'بروتوكول الدرع الكمي — عرض المشروع',
      speakerOrTeam: 'Team CipherX',
      startsAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    },
  });

  console.log('\n✅ Seed complete!');
  console.log(`   ${createdProjects.length} projects`);
  console.log(`   ${createdJudges.length} judges (password: judge123)`);
  console.log('   Admin: elias@lau.edu.lb / judge123');
}

seed().catch((err) => { console.error(err); process.exit(1); });
