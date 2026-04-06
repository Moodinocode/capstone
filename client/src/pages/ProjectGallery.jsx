import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ui/ProjectCard';
import { useLang } from '../context/LanguageContext';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';

const CATEGORIES = ['All Projects', 'Engineering', 'Tech Innovation', 'Social Impact', 'Business Strategy', 'Creative Arts', 'Med-Tech'];

export default function ProjectGallery() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Projects');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (activeCategory !== 'All Projects') params.set('category', activeCategory);
    api.get(`/projects?${params}`)
      .then((res) => setProjects(res.data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 mb-8 text-sm font-label font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-200 group"
      >
        <span className="material-icon text-base group-hover:-translate-x-0.5 transition-transform duration-200">arrow_back</span>
        Back
      </button>

      {/* Hero header */}
      <div className="mb-10">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-secondary mb-3">{t('projects.subtitle')}</p>
        <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
          {t('projects.title')}
        </h1>

        {/* Search */}
        <div className="relative max-w-lg">
          <span className="material-icon absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('projects.search')}
            className="w-full ps-12 pe-4 py-3.5 rounded-xl bg-surface-container-high text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm font-body transition-all duration-200"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-label font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-primary text-on-primary shadow-glow-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            {cat === 'All Projects' ? t('projects.all') : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-surface-container-high animate-pulse h-72" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-icon text-5xl text-on-surface-variant block mb-4">search_off</span>
          <p className="text-on-surface-variant font-label">{t('projects.noResults')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}
    </div>
  );
}
