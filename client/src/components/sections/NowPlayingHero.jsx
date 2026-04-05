import { useLiveSession } from '../../context/LiveSessionContext';
import { useLang } from '../../context/LanguageContext';

export default function NowPlayingHero() {
  const { nowPlaying, isEventLive, loading } = useLiveSession();
  const { t, lang } = useLang();

  if (loading) return (
    <div className="rounded-3xl bg-surface-container-high p-8 animate-pulse h-64" />
  );

  if (!isEventLive) return (
    <div className="rounded-2xl bg-surface-container-high p-10 flex flex-col items-center justify-center gap-4 min-h-64 text-center border border-outline-variant/30">
      <span className="material-icon text-5xl text-on-surface-variant">event</span>
      <p className="font-headline font-bold text-2xl text-on-surface">{t('live.notStarted')}</p>
    </div>
  );

  const title = lang === 'ar' && nowPlaying?.titleAr ? nowPlaying.titleAr : nowPlaying?.title;
  const sessionType = t(`session.${nowPlaying?.type}`) || nowPlaying?.type;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-primary shadow-card-hover">
      {/* Glow accent */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(26,39,68,0.04) 0%, transparent 70%)' }} />

      <div className="relative p-8 md:p-12">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
          </span>
          <span className="text-xs font-label font-bold uppercase tracking-widest text-red-300">{t('live.eventLive')}</span>
        </div>

        <p className="text-xs font-label font-semibold uppercase tracking-widest text-primary-container mb-3">{t('live.nowPlaying')}</p>

        {/* Session type */}
        <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-label font-bold uppercase tracking-wider mb-4">
          {sessionType}
        </span>

        {/* Title */}
        <h1 className="font-headline font-extrabold text-3xl md:text-5xl text-white leading-tight tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
          {title}
        </h1>

        <p className="text-white/70 text-base mb-8">{nowPlaying?.speakerOrTeam}</p>

        {/* CTA */}
        {nowPlaying?.zoomLink && (
          <a
            href={nowPlaying.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-16 px-8 rounded-xl bg-white text-primary font-headline font-extrabold text-base hover:bg-primary-container active:scale-95 transition-all duration-200 shadow-glow-primary"
          >
            <span className="material-icon">videocam</span>
            {t('live.joinSession')}
          </a>
        )}
      </div>
    </div>
  );
}
