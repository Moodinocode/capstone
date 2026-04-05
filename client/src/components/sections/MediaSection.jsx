const TALKS = [
  {
    id: 1,
    title: 'Innovating for Impact',
    speaker: 'Dr. Anya Sharma',
    category: 'Leadership',
    color: 'from-primary/30 to-primary/10',
  },
  {
    id: 2,
    title: 'Future of AI in Design',
    speaker: 'Mark Chen',
    category: 'Technology',
    color: 'from-secondary/30 to-secondary/10',
  },
  {
    id: 3,
    title: 'DataFlow Analytics',
    speaker: 'Dari Sharma',
    category: 'Data Science',
    color: 'from-tertiary/30 to-tertiary/10',
  },
  {
    id: 4,
    title: 'Urban Green Spaces',
    speaker: 'Mark Chen',
    category: 'Sustainability',
    color: 'from-primary/20 to-surface-container',
  },
  {
    id: 5,
    title: 'Mastering Emotional Intelligence',
    speaker: 'Sarah Khalil',
    category: 'Soft Skills',
    color: 'from-secondary/20 to-surface-container',
  },
  {
    id: 6,
    title: 'Leadership in the Digital Age',
    speaker: 'Omar Al-Hassan',
    category: 'Leadership',
    color: 'from-tertiary/20 to-surface-container',
  },
  {
    id: 7,
    title: 'Negotiation Dynamics',
    speaker: 'Team Leverage',
    category: 'Business',
    color: 'from-primary/25 to-surface-container',
  },
  {
    id: 8,
    title: 'Civic Pulse Platform',
    speaker: 'Team Agora',
    category: 'Social Impact',
    color: 'from-secondary/25 to-surface-container',
  },
];

function TalkCard({ talk }) {
  return (
    <div className="group relative bg-surface-container-high rounded-2xl overflow-hidden flex-none w-52 cursor-pointer hover:-translate-y-0.5 transition-all duration-300 shadow-card hover:shadow-card-hover">
      {/* Thumbnail */}
      <div className={`relative h-32 bg-gradient-to-br ${talk.color} flex items-center justify-center`}>
        {/* Play button */}
        <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-primary/30 group-hover:border-primary/50 transition-all duration-200">
          <span className="material-icon text-2xl text-white material-icon-filled" style={{ marginLeft: '2px' }}>
            play_arrow
          </span>
        </div>
        {/* Category pill */}
        <div className="absolute top-2 start-2">
          <span className="px-2 py-0.5 rounded-full bg-surface-container/80 text-[9px] font-label font-bold uppercase tracking-widest text-on-surface-variant backdrop-blur-sm">
            {talk.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-xs font-headline font-bold text-on-surface leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors duration-200">
          {talk.title}
        </h4>
        <p className="text-[10px] text-on-surface-variant">{talk.speaker}</p>
      </div>
    </div>
  );
}

export default function MediaSection() {
  return (
    <section id="media" className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Event Media
          </p>
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Pre-Recorded TED-Style Talks
          </h2>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {TALKS.map((talk) => (
          <TalkCard key={talk.id} talk={talk} />
        ))}
      </div>
    </section>
  );
}
