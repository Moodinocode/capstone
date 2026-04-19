import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLiveSession } from '../../context/LiveSessionContext';

export default function TopNavBar() {
  const { judge, logout } = useAuth();
  const { isEventLive } = useLiveSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-outline-variant shadow-nav-top">
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
            <span className="font-headline font-extrabold text-base tracking-tight text-on-surface group-hover:text-on-surface-variant transition-colors duration-200">
              Soft Skills<span className="text-on-surface-variant font-medium"> 2026</span>
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
                      ? 'text-on-surface bg-surface-container'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* User / judge avatar */}
            {judge ? (
              <div className="hidden md:flex items-center gap-2">
                <NavLink
                  to="/judge/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-highest transition-colors duration-200"
                  title={judge.name || 'Judge Dashboard'}
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-icon text-sm text-on-primary" style={{ fontSize: '14px' }}>person</span>
                  </div>
                  <span className="text-xs font-label font-semibold text-on-surface">{judge.name?.split(' ')[0]}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="p-2 text-on-surface-variant hover:text-error transition-colors duration-200 rounded-xl hover:bg-error-container"
                  title="Sign out"
                >
                  <span className="material-icon text-base">logout</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/judge/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-label font-semibold hover:bg-primary-fixed transition-all duration-200"
                title="Judge Portal"
              >
                <span className="material-icon text-sm">verified_user</span>
                Judge Portal
              </NavLink>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-icon">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1 border-t border-outline-variant pt-3 mt-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-label font-medium rounded-xl transition-colors ${
                    isActive ? 'text-on-surface bg-surface-container' : 'text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {judge ? (
              <>
                <NavLink
                  to="/judge/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-on-surface"
                >
                  {judge.name}
                </NavLink>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="px-4 py-3 text-sm font-medium text-error text-start"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <NavLink
                to="/judge/login"
                onClick={() => setMenuOpen(false)}
                className="mx-2 mt-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-primary text-on-primary text-sm font-label font-semibold"
              >
                <span className="material-icon text-base">verified_user</span>
                Judge Portal
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
