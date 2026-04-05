import { useLang } from '../context/LanguageContext';

const SCHEDULE = [
  { time: '09:00', duration: 30,  type: 'Opening',     title: 'Opening Ceremony',                        titleAr: 'حفل الافتتاح',                      speaker: 'Dean of Student Affairs' },
  { time: '09:30', duration: 20,  type: 'TED Talk',    title: 'Mastering Emotional Intelligence',          titleAr: 'إتقان الذكاء العاطفي',              speaker: 'Sarah Khalil' },
  { time: '09:50', duration: 15,  type: 'Pitch',       title: 'Autonomous Site Inspector (P-201)',         titleAr: 'مفتش المواقع الذاتي',               speaker: 'Team Alpha' },
  { time: '10:05', duration: 15,  type: 'Pitch',       title: 'Solar-Pulse Drone (P-202)',                 titleAr: 'طائرة نبض الطاقة الشمسية',          speaker: 'Team Helios' },
  { time: '10:20', duration: 15,  type: 'Pitch',       title: 'Quantum Shielding Protocol (P-203)',        titleAr: 'بروتوكول الدرع الكمي',              speaker: 'Team CipherX' },
  { time: '10:35', duration: 10,  type: 'Break',       title: 'Coffee Break',                             titleAr: 'استراحة القهوة',                    speaker: '' },
  { time: '10:45', duration: 15,  type: 'Pitch',       title: 'ShieldGate AI (P-204)',                    titleAr: 'بوابة الدرع الذكي',                 speaker: 'Team Firewall' },
  { time: '11:00', duration: 15,  type: 'Pitch',       title: 'Civic Pulse Platform (P-205)',             titleAr: 'منصة النبض المدني',                 speaker: 'Team Agora' },
  { time: '11:15', duration: 15,  type: 'Pitch',       title: 'EcoFlow Solutions (P-206)',                titleAr: 'حلول إيكوفلو',                      speaker: 'Team GreenWave' },
  { time: '11:30', duration: 20,  type: 'TED Talk',    title: 'Leadership in the Digital Age',            titleAr: 'القيادة في العصر الرقمي',           speaker: 'Omar Al-Hassan' },
  { time: '11:50', duration: 15,  type: 'Pitch',       title: 'Eco-Supply Chain AI (P-207)',              titleAr: 'سلسلة التوريد البيئية',             speaker: 'Team LogiGreen' },
  { time: '12:05', duration: 15,  type: 'Pitch',       title: 'Negotiation Dynamics (P-208)',             titleAr: 'ديناميكيات التفاوض',                speaker: 'Team Leverage' },
  { time: '12:20', duration: 40,  type: 'Break',       title: 'Lunch Break',                             titleAr: 'استراحة الغداء',                    speaker: '' },
  { time: '13:00', duration: 15,  type: 'Pitch',       title: 'Neural Canvas (P-209)',                   titleAr: 'القماش العصبي',                     speaker: 'Team Luminary' },
  { time: '13:15', duration: 15,  type: 'Pitch',       title: 'Visual Storytelling (P-210)',             titleAr: 'السرد البصري',                      speaker: 'Team Narrative' },
  { time: '13:30', duration: 15,  type: 'Pitch',       title: 'BioSync Patch (P-211)',                   titleAr: 'رقعة بيوسينك',                      speaker: 'Team VitalTech' },
  { time: '13:45', duration: 15,  type: 'Pitch',       title: 'AI-Driven Soft Skills (P-212)',           titleAr: 'تعزيز المهارات بالذكاء الاصطناعي', speaker: 'Team EduSpark' },
  { time: '14:00', duration: 30,  type: 'Networking',  title: 'Expo & Networking',                        titleAr: 'معرض وتواصل',                       speaker: '' },
  { time: '14:30', duration: 30,  type: 'Closing',     title: 'Awards & Closing Ceremony',               titleAr: 'حفل التكريم والختام',               speaker: 'Faculty & Guests' },
];

const TYPE_STYLES = {
  'Opening':    'bg-secondary/20 text-secondary',
  'TED Talk':   'bg-primary/20 text-primary',
  'Pitch':      'bg-surface-container-highest text-on-surface-variant',
  'Break':      'bg-outline-variant/20 text-outline',
  'Networking': 'bg-tertiary/20 text-tertiary',
  'Closing':    'bg-secondary/20 text-secondary',
};

export default function Schedule() {
  const { t, lang } = useLang();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-secondary mb-3">{t('schedule.subtitle')}</p>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          {t('schedule.title')}
        </h1>
      </div>

      <div className="space-y-2">
        {SCHEDULE.map((item, i) => {
          const title = lang === 'ar' && item.titleAr ? item.titleAr : item.title;
          const typeStyle = TYPE_STYLES[item.type] ?? TYPE_STYLES.Pitch;

          return (
            <div key={i} className={`flex gap-4 p-4 rounded-2xl transition-colors ${item.type === 'Break' ? 'opacity-60' : 'bg-surface-container-high hover:bg-surface-container-highest'}`}>
              {/* Time */}
              <div className="shrink-0 w-16 text-end">
                <span className="text-sm font-label font-semibold text-on-surface-variant tabular-nums">{item.time}</span>
                <p className="text-xs text-outline mt-0.5">{item.duration}m</p>
              </div>

              {/* Line */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest ring-2 ring-outline-variant mt-1" />
                {i < SCHEDULE.length - 1 && <div className="w-px flex-1 bg-outline-variant/40 mt-1" />}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-headline font-semibold text-on-surface text-base leading-snug">{title}</p>
                    {item.speaker && <p className="text-xs text-on-surface-variant mt-0.5">{item.speaker}</p>}
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-widest ${typeStyle}`}>
                    {t(`session.${item.type}`) || item.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
