import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/travel', icon: '🚗', label: 'Travel' },
  { to: '/food', icon: '🍽️', label: 'Food' },
  { to: '/waste', icon: '🗑️', label: 'Waste' },
  { to: '/electricity', icon: '⚡', label: 'Electric' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/leaderboard', icon: '🏆', label: 'Ranks' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
