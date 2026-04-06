import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventProgramTimeline from '../components/sections/EventProgramTimeline';
import FanVoteLeaderboard from '../components/sections/FanVoteLeaderboard';
import MediaSection from '../components/sections/MediaSection';
import HubProjectCard from '../components/ui/HubProjectCard';
import api from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects?limit=50')
      .then((res) => {
        // Show all projects sorted by vote count desc
        const sorted = [...res.data.projects].sort((a, b) => b.voteCount - a.voteCount);
        setProjects(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalVotes = projects.reduce((sum, p) => sum + (p.voteCount || 0), 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Three-column hub layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Event timeline */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <div className="lg:sticky lg:top-24">
            <EventProgramTimeline />
          </div>
        </aside>

        {/* CENTER: Project voting grid */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-surface-container-high animate-pulse h-64" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <span className="material-icon text-5xl text-on-surface-variant">science</span>
              <p className="text-on-surface-variant">No projects yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p, i) => (
                <HubProjectCard
                  key={p._id}
                  project={p}
                  index={i}
                  totalVotes={totalVotes}
                />
              ))}
            </div>
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

      {/* BOTTOM: Media section — full width */}
      <MediaSection />
    </div>
  );
}
