import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLiveSession } from '../context/LiveSessionContext';

// ─────────────────────────────────────────────
// Rank visual vocabulary (extends FanVoteLeaderboard's palette)
// ─────────────────────────────────────────────
const RANK_STYLES = {
  1: {
    label:       '1st Place',
    medal:       'workspace_premium',
    border:      'border-amber-400',
    bg:          'bg-gradient-to-br from-amber-50 to-white',
    ring:        'ring-2 ring-amber-400/40',
    glow:        'shadow-[0_0_40px_rgba(251,191,36,0.35)]',
    badgeBg:     'bg-amber-400',
    badgeText:   'text-white',
    accentText:  'text-amber-700',
  },
  2: {
    label:       '2nd Place',
    medal:       'military_tech',
    border:      'border-slate-300',
    bg:          'bg-gradient-to-br from-slate-50 to-white',
    ring:        'ring-2 ring-slate-300/40',
    glow:        'shadow-[0_0_24px_rgba(148,163,184,0.28)]',
    badgeBg:     'bg-slate-400',
    badgeText:   'text-white',
    accentText:  'text-slate-700',
  },
  3: {
    label:       '3rd Place',
    medal:       'military_tech',
    border:      'border-orange-300',
    bg:          'bg-gradient-to-br from-orange-50 to-white',
    ring:        'ring-2 ring-orange-300/40',
    glow:        'shadow-[0_0_24px_rgba(251,146,60,0.28)]',
    badgeBg:     'bg-orange-400',
    badgeText:   'text-white',
    accentText:  'text-orange-700',
  },
};

// ─────────────────────────────────────────────
// Winner card — size variant drives layout
// ─────────────────────────────────────────────
function WinnerCard({ winner, size = 'md', delayMs = 0, showImage = true }) {
  const style = RANK_STYLES[winner.rank];
  const isChampion = winner.rank === 1;

  const sizeClasses = size === 'lg'
    ? 'p-6 md:p-8'
    : 'p-5 md:p-6';

  const imageClasses = size === 'lg'
    ? 'h-52 md:h-64'
    : 'h-40 md:h-44';

  const titleClasses = size === 'lg'
    ? 'text-xl md:text-2xl'
    : 'text-base md:text-lg';

  return (
    <Link
      to={`/projects/${winner.id}`}
      className={`group relative block rounded-3xl border ${style.border} ${style.bg} ${style.ring} ${style.glow} ${sizeClasses}
        transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_48px_rgba(251,191,36,0.45)]
        motion-reduce:hover:translate-y-0 motion-reduce:transition-none
        opacity-0 animate-fade-in`}
      style={{ animationDelay: `${delayMs}ms`, animationFillMode: 'forwards' }}
    >
      {/* Rank plate */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${style.badgeBg} ${style.badgeText} shadow-sm`}>
          <span className="material-icon material-icon-filled text-sm">{style.medal}</span>
          <span className="text-xs font-label font-bold uppercase tracking-wider">{style.label}</span>
        </div>
        {isChampion && (
          <span className="flex items-center gap-1 text-[10px] font-label font-bold uppercase tracking-widest text-amber-700">
            <span className="material-icon material-icon-filled text-sm">emoji_events</span>
            Champion
          </span>
        )}
      </div>

      {/* Image */}
      {showImage && (
        <div className={`relative rounded-2xl overflow-hidden mb-4 bg-surface-container ${imageClasses}`}>
          <img
            src={winner.imageUrl}
            alt={winner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
          {winner.projectNumber}
        </span>
        <span className="w-1 h-1 rounded-full bg-outline" />
        <span className="text-[10px] font-label text-on-surface-variant">{winner.category}</span>
      </div>

      {/* Title */}
      <h3 className={`font-headline font-extrabold text-on-surface leading-tight mb-1 ${titleClasses}`}>
        {winner.title}
      </h3>

      {/* Team / speaker */}
      <p className="text-sm font-label text-on-surface-variant mb-4">{winner.teamOrSpeaker}</p>

      {/* Score */}
      {winner.totalScore != null && (
        <div className="flex items-end justify-between pt-3 border-t border-outline-variant/60">
          <div>
            <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
              Avg. score
            </p>
            <p className={`font-headline font-extrabold ${size === 'lg' ? 'text-3xl' : 'text-xl'} ${style.accentText}`}>
              {winner.totalScore.toFixed(1)}
              <span className="text-sm font-label font-medium text-on-surface-variant ms-1">/ 25</span>
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-label font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">
            View
            <span className="material-icon text-base rtl:rotate-180">arrow_forward</span>
          </span>
        </div>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────
// Honorable mention — smaller, compact
// ─────────────────────────────────────────────
function HonorableCard({ winner, delayMs = 0, showImage = true }) {
  return (
    <Link
      to={`/projects/${winner.id}`}
      className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-outline-variant hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0
        opacity-0 animate-fade-in"
      style={{ animationDelay: `${delayMs}ms`, animationFillMode: 'forwards' }}
    >
      {showImage && (
        <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-surface-container">
          <img src={winner.imageUrl} alt={winner.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
          {winner.projectNumber}
        </p>
        <p className="text-sm font-label font-semibold text-on-surface truncate leading-tight">{winner.title}</p>
        <p className="text-xs font-label text-on-surface-variant truncate">{winner.teamOrSpeaker}</p>
      </div>
      <span className="material-icon text-base text-outline group-hover:text-on-surface transition-colors rtl:rotate-180">
        chevron_right
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Category section — podium + honorable mentions
// ─────────────────────────────────────────────
function CategorySection({ icon, label, title, subtitle, data, baseDelay = 0, showImage = true }) {
  const [first, second, third] = data.champions ?? [];
  const hasHonorable = (data.honorableMentions ?? []).length > 0;

  if (!first) return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-start gap-3 mb-6">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant">
          <span className="material-icon text-xl text-on-surface">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
          <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface">{title}</h2>
        </div>
      </div>
      <p className="text-sm text-on-surface-variant">Results will appear once judging is complete.</p>
    </section>
  );

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Section header */}
      <div className="flex items-start gap-3 mb-8 md:mb-12">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant">
          <span className="material-icon text-xl text-on-surface">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            {label}
          </p>
          <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface">{title}</h2>
          {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Podium */}
      {/* Mobile: stack in rank order. Desktop: classic Olympic arrangement (2 | 1 | 3) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 md:items-end">
        {/* 2nd — desktop left, mobile second */}
        {second && (
          <div className="md:col-span-4 md:order-1 order-2 md:pt-8">
            <WinnerCard winner={second} size="md" delayMs={baseDelay + 200} showImage={showImage} />
          </div>
        )}

        {/* 1st — center, larger */}
        {first && (
          <div className="md:col-span-4 md:order-2 order-1">
            <WinnerCard winner={first} size="lg" delayMs={baseDelay} showImage={showImage} />
          </div>
        )}

        {/* 3rd — desktop right, mobile third */}
        {third && (
          <div className="md:col-span-4 md:order-3 order-3 md:pt-16">
            <WinnerCard winner={third} size="md" delayMs={baseDelay + 400} showImage={showImage} />
          </div>
        )}
      </div>

      {/* Honorable mentions */}
      {hasHonorable && (
        <div className="mt-10 md:mt-14">
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            Honorable Mentions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(data.honorableMentions ?? []).map((hm, i) => (
              <HonorableCard key={hm.id} winner={hm} delayMs={baseDelay + 600 + i * 80} showImage={showImage} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// People's Choice — violet-accented single winner
// ─────────────────────────────────────────────
function PeoplesChoice({ winner, baseDelay = 0, voteCountVisible = true }) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div
        className="relative overflow-hidden rounded-3xl border border-tertiary/30 bg-gradient-to-br from-tertiary-container via-white to-white p-6 md:p-10
          shadow-[0_0_40px_rgba(124,58,237,0.18)]
          opacity-0 animate-fade-in"
        style={{ animationDelay: `${baseDelay}ms`, animationFillMode: 'forwards' }}
      >
        {/* Decorative violet glow */}
        <div className="pointer-events-none absolute -top-24 start-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-tertiary/15 blur-3xl" aria-hidden />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Text */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icon material-icon-filled text-tertiary">favorite</span>
              <p className="text-xs font-label font-bold uppercase tracking-widest text-tertiary">
                People's Choice
              </p>
            </div>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface leading-tight mb-3">
              Chosen by the audience
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant mb-6 max-w-md">
              A separate honor, awarded by the thousands of votes cast by attendees throughout the event.
            </p>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                {winner.projectNumber}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span className="text-[10px] font-label text-on-surface-variant">{winner.category}</span>
            </div>
            <h3 className="font-headline font-extrabold text-xl md:text-2xl text-on-surface mb-1">{winner.title}</h3>
            <p className="text-sm font-label text-on-surface-variant mb-5">{winner.teamOrSpeaker}</p>

            <div className="flex items-center gap-5">
              <Link
                to={`/projects/${winner.id}`}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-tertiary text-on-tertiary text-sm font-label font-semibold hover:bg-tertiary-dim transition-colors"
              >
                View Spotlight
                <span className="material-icon text-base rtl:rotate-180">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-surface-container border border-tertiary/20 shadow-glow-primary">
              <img src={winner.imageUrl} alt={winner.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Hero header
// ─────────────────────────────────────────────
function WinnersHero() {
  return (
    <header className="relative overflow-hidden border-b border-outline-variant bg-gradient-to-b from-amber-50/60 via-white to-white">
      {/* Decorative amber glow */}
      <div className="pointer-events-none absolute -top-32 start-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-amber-200/30 blur-3xl" aria-hidden />
      {/* Subtle dots pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #111827 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        {/* Trophy icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-primary text-on-primary mb-6 shadow-glow-secondary animate-fade-in"
             style={{ animationDelay: '0ms' }}>
          <span className="material-icon material-icon-filled text-3xl md:text-4xl">emoji_events</span>
        </div>

        <p className="text-xs md:text-sm font-label font-bold uppercase tracking-[0.25em] text-on-surface-variant mb-3 animate-fade-in"
           style={{ animationDelay: '100ms' }}>
          LAU Soft Skills Event
        </p>
        <h1 className="font-headline font-extrabold text-4xl md:text-6xl lg:text-7xl text-on-surface leading-[1.05] mb-5 animate-fade-in"
            style={{ animationDelay: '200ms' }}>
          The Winners
        </h1>
        <p className="text-base md:text-lg text-on-surface-variant max-w-xl mx-auto animate-fade-in"
           style={{ animationDelay: '300ms' }}>
          Celebrating excellence across pitches, talks, and interviews — chosen by our panel of judges and the attendee community.
        </p>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Winners() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { voteCountVisible } = useLiveSession();

  useEffect(() => {
    api.get('/winners')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const empty = { champions: [], honorableMentions: [] };

  return (
    <div className="min-h-screen bg-background">
      <WinnersHero />

      {loading && (
        <div className="flex justify-center items-center py-32">
          <span className="material-icon animate-spin text-4xl text-on-surface-variant">progress_activity</span>
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-32 text-on-surface-variant">
          <span className="material-icon text-4xl mb-4 block">error_outline</span>
          <p className="font-label">Could not load results. Please try again later.</p>
        </div>
      )}

      {!loading && data && (
        <>
          <CategorySection
            icon="science"
            label="Track 01"
            title="Business Plan Pitches"
            subtitle="Top pitches ranked by our judge panel's combined rubric scores"
            data={data.pitches ?? empty}
            baseDelay={400}
          />

          <div className="h-px max-w-6xl mx-auto bg-outline-variant" />

          <CategorySection
            icon="mic"
            label="Track 02"
            title="TED-Style Talks"
            subtitle="The talks that moved, challenged, and inspired the room the most"
            data={data.tedTalks ?? empty}
            baseDelay={400}
            showImage={false}
          />

          <div className="h-px max-w-6xl mx-auto bg-outline-variant" />

          <CategorySection
            icon="record_voice_over"
            label="Track 03"
            title="Mock Interviews"
            subtitle="Candidates who brought the clearest thinking and strongest presence"
            data={data.interviews ?? empty}
            baseDelay={400}
            showImage={false}
          />

          {data.peoplesChoice && (
            <>
              <div className="h-px max-w-6xl mx-auto bg-outline-variant" />
              <PeoplesChoice winner={data.peoplesChoice} baseDelay={400} voteCountVisible={voteCountVisible} />
            </>
          )}
        </>
      )}

      {/* Closing note */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <p className="text-sm md:text-base text-on-surface-variant">
          Thank you to every team, speaker, and candidate who shared their work with us today.
          Every submission moved the event forward.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 mt-6 px-5 py-3 rounded-xl bg-surface-container text-on-surface text-sm font-label font-semibold hover:bg-surface-container-highest transition-colors border border-outline-variant"
        >
          Browse all participants
          <span className="material-icon text-base rtl:rotate-180">arrow_forward</span>
        </Link>
      </footer>
    </div>
  );
}
