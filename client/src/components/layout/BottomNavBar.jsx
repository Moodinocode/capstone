import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BottomNavBar() {
  const { judge } = useAuth();

  const items = [
    { to: '/',         icon: 'home',         label: 'Hub' },
    judge
      ? { to: '/judge/dashboard', icon: 'verified_user', label: 'Judging' }
      : { to: '/judge/login',     icon: 'login',         label: 'Judging' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-outline-variant/40"
      style={{ background: 'rgba(12, 14, 18, 0.97)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-stretch h-16">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-icon text-2xl ${isActive ? 'material-icon-filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-label font-medium tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
