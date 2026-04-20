import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const CARD_COLORS = [
  'from-primary/30 to-primary/10',
  'from-secondary/30 to-secondary/10',
  'from-tertiary/30 to-tertiary/10',
  'from-primary/20 to-surface-container',
  'from-secondary/20 to-surface-container',
  'from-tertiary/20 to-surface-container',
];

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  // Google Drive
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  // Assume it's already an embed-compatible URL
  return url;
}

function ModalTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const danger = elapsed >= 180;
  const warn   = elapsed >= 120 && !danger;

  return (
    <div className="flex items-center gap-2">
      <span className={`font-headline font-bold text-lg tabular-nums ${danger ? 'text-error' : warn ? 'text-amber-500' : 'text-on-surface'}`}>
        {mm}:{ss}
      </span>
      <button
        onClick={() => setRunning((r) => !r)}
        className={`p-1 rounded-lg transition-colors ${running ? 'text-on-surface hover:bg-surface-container' : 'text-primary hover:bg-primary/10'}`}
        title={running ? 'Pause' : 'Start'}
      >
        <span className="material-icon text-base">{running ? 'pause' : 'play_arrow'}</span>
      </button>
      <button
        onClick={() => { setElapsed(0); setRunning(false); }}
        className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
        title="Reset"
      >
        <span className="material-icon text-base">restart_alt</span>
      </button>
    </div>
  );
}

function VideoModal({ talk, onClose }) {
  const embedUrl = getEmbedUrl(talk.videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-outline-variant">
          <div>
            <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
              TED Talk
            </p>
            <h3 className="font-headline font-bold text-on-surface text-base leading-snug">{talk.title}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{talk.teamName}</p>
          </div>
          <div className="flex items-center gap-3">
            <ModalTimer />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-icon">close</span>
            </button>
          </div>
        </div>

        {/* Video */}
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={talk.title}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-8">
            <span className="material-icon text-4xl text-on-surface-variant">videocam_off</span>
            <p className="text-on-surface-variant text-sm">Recording not available yet — check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TalkCard({ talk, index, onClick }) {
  const color    = CARD_COLORS[index % CARD_COLORS.length];
  const hasVideo = !!talk.videoUrl;

  return (
    <div
      onClick={hasVideo ? onClick : undefined}
      className={`group relative bg-white rounded-2xl overflow-hidden flex-none w-52 transition-all duration-300 shadow-card border border-outline-variant ${
        hasVideo ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover' : 'opacity-70'
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative h-32 bg-gradient-to-br ${color} flex items-center justify-center`}>
        {hasVideo ? (
          <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-all duration-200">
            <span className="material-icon text-2xl text-on-surface material-icon-filled" style={{ marginLeft: '2px' }}>
              play_arrow
            </span>
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="material-icon text-xl text-on-surface-variant">schedule</span>
          </div>
        )}
        {/* Category pill */}
        <div className="absolute top-2 start-2">
          <span className="px-2 py-0.5 rounded-full bg-white/80 text-[9px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
            {talk.category}
          </span>
        </div>
        {!hasVideo && (
          <div className="absolute bottom-2 end-2">
            <span className="px-2 py-0.5 rounded-full bg-surface-container/80 text-[9px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-xs font-headline font-bold text-on-surface leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors duration-200">
          {talk.title}
        </h4>
        <p className="text-[10px] text-on-surface-variant">{talk.teamName}</p>
      </div>
    </div>
  );
}

export default function MediaSection() {
  const [talks, setTalks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  useEffect(() => {
    api.get('/projects?segmentType=ted_talk&limit=20')
      .then((res) => setTalks(res.data.projects ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="media" className="mt-8 space-y-8">

      {/* Event Trailer */}
      <div>
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          Official Trailer
        </p>
        <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
          Soft Skills 2026: A Student Talent Special Edition
        </h2>
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-card bg-surface-container-high"
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            src="https://drive.google.com/file/d/1i1sKDahY94nTQ7D7vH0ZTzpBG7HnsryF/preview"
            title="Soft Skills 2026 Event Trailer"
            allow="autoplay"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>

      {/* Testimonial Video */}
      <div>
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          Testimonial
        </p>
        <h2 className="font-headline font-bold text-lg text-on-surface mb-4">
          What Students Say
        </h2>
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-card bg-surface-container-high"
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            src="https://drive.google.com/file/d/1PmOl9f4GgmO6lhncQV4xqtlIlO8dROsV/preview"
            title="Student Testimonial"
            allow="autoplay"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>

      {/* TED Talk cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              Event Media
            </p>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              TED Talks
            </h2>
          </div>
          {!loading && talks.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll(-1)}
                className="p-2 rounded-xl border border-outline-variant bg-white text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-icon text-base">arrow_back</span>
              </button>
              <button
                onClick={() => scroll(1)}
                className="p-2 rounded-xl border border-outline-variant bg-white text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-icon text-base">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-none w-52 h-44 rounded-2xl bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : talks.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No talks available yet.</p>
        ) : (
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {talks.map((talk, i) => (
              <TalkCard
                key={talk._id}
                talk={talk}
                index={i}
                onClick={() => setSelected(talk)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video modal */}
      {selected && (
        <VideoModal talk={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
