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
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-outline-variant shadow-nav-bottom"
    >
      <div className="flex items-stretch h-16">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 ${
                isActive ? 'text-on-surface' : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors duration-200 ${isActive ? 'bg-surface-container' : ''}`}>
                  <span className={`material-icon text-xl ${isActive ? 'material-icon-filled' : ''}`}>
                    {item.icon}
                  </span>
                </div>
                <span className={`text-[10px] font-label font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
