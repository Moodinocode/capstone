import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useLiveSession } from '../../context/LiveSessionContext';

export default function TopNavBar() {
  const { toggle, lang } = useLang();
  const { judge, logout } = useAuth();
  const { isEventLive } = useLiveSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/projects', label: 'Projects' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 border-b border-outline-variant/50"
         style={{ background: 'rgba(12, 14, 18, 0.95)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            {isEventLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
              </span>
            )}
            <span className="font-headline font-extrabold text-base tracking-tight text-on-surface group-hover:text-primary transition-colors duration-200">
              Project Event Hero &amp; Hub
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-label font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Media link — scrolls to #media on home */}
            <a
              href="/#media"
              className="px-4 py-2 text-sm font-label font-medium rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-200"
            >
              Media
            </a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggle}
              className="px-3 py-1.5 text-xs font-label font-semibold rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors duration-200 tracking-widest uppercase border border-outline-variant/50"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>

            {/* User / judge avatar */}
            {judge ? (
              <div className="hidden md:flex items-center gap-2">
                <NavLink
                  to="/judge/dashboard"
                  className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors duration-200"
                  title={judge.name || 'Judge Dashboard'}
                >
                  <span className="material-icon text-base text-primary">person</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="p-2 text-on-surface-variant hover:text-error transition-colors duration-200 rounded-xl hover:bg-surface-container-high"
                  title="Sign out"
                >
                  <span className="material-icon text-base">logout</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/judge/login"
                className="hidden md:flex w-9 h-9 rounded-full bg-surface-container-high items-center justify-center hover:bg-surface-container-highest transition-colors duration-200"
                title="Judge Portal"
              >
                <span className="material-icon text-base text-on-surface-variant">person</span>
              </NavLink>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-icon">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1 border-t border-outline-variant/30 pt-3 mt-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-label font-medium rounded-xl transition-colors ${
                    isActive ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="/#media"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm font-label font-medium rounded-xl text-on-surface-variant hover:text-on-surface"
            >
              Media
            </a>
            {judge ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="px-4 py-3 text-sm font-medium text-error text-start"
              >
                Sign Out
              </button>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}
