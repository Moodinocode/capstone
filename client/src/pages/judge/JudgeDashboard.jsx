import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

export default function JudgeDashboard() {
  const { t, lang } = useLang();
  const { judge, logout } = useAuth();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [ungraded, setUngraded] = useState([]);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/grades/my'),
      api.get('/projects?limit=50'),
    ]).then(([gradesRes, projectsRes]) => {
      setGrades(gradesRes.data.grades);
      setUngraded(gradesRes.data.ungraded);
      const map = {};
      projectsRes.data.projects.forEach((p) => { map[p._id] = p; });
      setProjects(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submitted  = grades.filter((g) => g.status === 'submitted').length;
  const inProgress = grades.filter((g) => g.status === 'in_progress').length;
  const total      = grades.length + ungraded.length;

  // Build full list: graded + ungraded
  const allItems = [
    ...grades.map((g) => ({ grade: g, project: g.project })),
    ...ungraded.map((u) => {
      const proj = projects[u.project?.toString()];
      return { grade: u, project: proj ?? { _id: u.project, title: 'Loading...', category: '—', projectNumber: '—' } };
    }),
  ];

  const getStatus = (grade) => grade.status ?? 'not_started';

  const getCTA = (grade, projectId) => {
    const status = getStatus(grade);
    if (status === 'submitted')   return { label: t('judge.viewScore'),  to: `/judge/grade/${projectId}` };
    if (status === 'in_progress') return { label: t('judge.continue'),   to: `/judge/grade/${projectId}` };
    return { label: t('judge.evaluate'), to: `/judge/grade/${projectId}` };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t('judge.welcome')}</p>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface">{judge?.name}</h1>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-label font-semibold text-on-surface-variant hover:text-error hover:bg-error/10 transition-all duration-200"
        >
          <span className="material-icon text-base">logout</span>
          {t('judge.logout')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: t('judge.total'),     value: total,      icon: 'list_alt',    color: 'text-on-surface' },
          { label: t('judge.completed'), value: submitted,  icon: 'check_circle',color: 'text-secondary' },
          { label: t('judge.pending'),   value: total - submitted, icon: 'pending', color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-2">
            <span className={`material-icon text-2xl ${stat.color}`}>{stat.icon}</span>
            <p className={`font-headline font-extrabold text-3xl ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-label text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-label font-semibold text-on-surface-variant">{t('judge.completed')}</p>
          <p className="text-xs font-label font-semibold text-on-surface-variant">{submitted} {t('common.of')} {total}</p>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{ width: total > 0 ? `${(submitted / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Assignment list */}
      <div>
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">{t('judge.assigned')}</p>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-surface-container-high animate-pulse h-20" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {allItems.map(({ grade, project }, i) => {
              const status = getStatus(grade);
              const cta = getCTA(grade, project?._id ?? grade.project);
              const title = lang === 'ar' && project?.titleAr ? project.titleAr : project?.title;
              return (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest transition-colors duration-200">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
                    <span className="text-xs font-label font-bold text-on-surface-variant">{project?.projectNumber ?? '—'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-semibold text-on-surface text-sm truncate">{title ?? 'Untitled'}</p>
                    <p className="text-xs text-on-surface-variant">{project?.category}</p>
                  </div>
                  <StatusBadge status={status} />
                  {status === 'submitted' ? (
                    <Link to={cta.to} className="shrink-0 px-4 py-2 rounded-xl text-xs font-label font-semibold text-on-surface-variant bg-surface-container-highest hover:text-on-surface transition-colors">
                      {cta.label}
                    </Link>
                  ) : (
                    <Link to={cta.to} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-label font-semibold transition-all duration-200 ${
                      status === 'in_progress'
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-primary text-on-primary hover:shadow-glow-primary'
                    }`}>
                      {cta.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
