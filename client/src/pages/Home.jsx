import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventProgramTimeline from '../components/sections/EventProgramTimeline';
import FanVoteLeaderboard from '../components/sections/FanVoteLeaderboard';
import MediaSection from '../components/sections/MediaSection';
import HubProjectCard from '../components/ui/HubProjectCard';
import api from '../services/api';

// How far each step is horizontally (px). Controls how much of adjacent cards is visible.
const STEP = 210;
// Cards within this offset range from active are rendered
const VISIBLE_RANGE = 2;

function cardStyle(offset) {
  const abs = Math.abs(offset);
  const scale   = abs === 0 ? 1 : abs === 1 ? 0.86 : 0.74;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.60 : 0.28;
  const rotateY = offset * -9; // degrees — left tilts right, right tilts left
  const blur    = abs === 0 ? 0 : abs === 1 ? 1.5 : 3;
  const zIndex  = 10 - abs * 3;

  return {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: '260px',
    transform: `translateX(calc(-50% + ${offset * STEP}px)) scale(${scale}) perspective(900px) rotateY(${rotateY}deg)`,
    opacity,
    filter: blur > 0 ? `blur(${blur}px)` : 'none',
    zIndex,
    transition: 'all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    pointerEvents: abs === 0 ? 'auto' : 'none',
  };
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    api.get('/projects?limit=50')
      .then((res) => {
        const sorted = [...res.data.projects].sort((a, b) => b.voteCount - a.voteCount);
        setProjects(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalVotes = projects.reduce((sum, p) => sum + (p.voteCount || 0), 0);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < projects.length - 1;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Event timeline */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <div className="lg:sticky lg:top-24">
            <EventProgramTimeline />
          </div>
        </aside>

        {/* CENTER: 3D Carousel */}
        <main className="lg:col-span-6 order-1 lg:order-2">
          <div className="mb-5">
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              People's Choice
            </p>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Vote for Your Favourite Project
            </h1>
          </div>

          {loading ? (
            <div className="relative h-80 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-2xl bg-white border border-outline-variant animate-pulse"
                  style={{
                    ...cardStyle(i - 1),
                    height: '300px',
                    transition: 'none',
                  }}
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <span className="material-icon text-5xl text-on-surface-variant">science</span>
              <p className="text-on-surface-variant">No projects yet — check back soon.</p>
            </div>
          ) : (
            <>
              {/* Carousel stage */}
              <div className="relative overflow-hidden" style={{ height: '400px' }}>
                {projects.map((p, i) => {
                  const offset = i - activeIndex;
                  if (Math.abs(offset) > VISIBLE_RANGE) return null;
                  return (
                    <div key={p._id} style={cardStyle(offset)}>
                      <HubProjectCard project={p} index={i} totalVotes={totalVotes} />
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 px-1">
                <button
                  onClick={() => setActiveIndex((n) => Math.max(0, n - 1))}
                  disabled={!canPrev}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-label font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-outline-variant"
                >
                  <span className="material-icon text-base">arrow_back</span>
                  Prev
                </button>

                {/* Dot indicators */}
                <div className="flex gap-1.5 items-center">
                  {projects.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeIndex
                          ? 'w-5 h-1.5 bg-on-surface'
                          : 'w-1.5 h-1.5 bg-outline-variant hover:bg-on-surface-variant'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveIndex((n) => Math.min(projects.length - 1, n + 1))}
                  disabled={!canNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-label font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-outline-variant"
                >
                  Next
                  <span className="material-icon text-base">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {!loading && projects.length > 0 && (
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest text-sm font-label font-semibold transition-all duration-200 border border-outline-variant/40"
            >
              View All Projects
              <span className="material-icon text-base">arrow_forward</span>
            </button>
          )}
        </main>

        {/* RIGHT: Leaderboard */}
        <aside className="lg:col-span-3 order-3">
          <div className="lg:sticky lg:top-24">
            <FanVoteLeaderboard />
          </div>
        </aside>
      </div>

      <MediaSection />
    </div>
  );
}
