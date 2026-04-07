import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

export default function JudgeLogin() {
  const { t } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/judge/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <span className="material-icon text-3xl text-on-primary">verified_user</span>
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface">{t('judge.login')}</h1>
          <p className="text-on-surface-variant text-sm mt-2">{t('judge.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 flex flex-col gap-5 shadow-card border border-outline-variant">
          <div>
            <label className="block text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
              {t('judge.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-xl bg-surface-container text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-on-surface text-sm transition-all duration-200 border border-outline-variant"
              placeholder="judge@lau.edu.lb"
            />
          </div>

          <div>
            <label className="block text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
              {t('judge.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3.5 rounded-xl bg-surface-container text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-on-surface text-sm transition-all duration-200 border border-outline-variant"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-error bg-error-container rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-primary text-on-primary font-headline font-bold text-base hover:bg-primary-fixed active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="material-icon animate-spin">progress_activity</span>
            ) : t('judge.signIn')}
          </button>

          <p className="text-center text-xs text-on-surface-variant">
            Demo: elias@lau.edu.lb / judge123
          </p>
        </form>
      </div>
    </div>
  );
}
