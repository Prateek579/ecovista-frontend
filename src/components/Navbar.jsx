import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/travel') return 'Travel';
    if (path.startsWith('/food')) return 'Food';
    if (path.startsWith('/waste')) return 'Waste';
    if (path === '/electricity') return 'Electricity';
    if (path === '/analytics') return 'Analytics';
    if (path === '/leaderboard') return 'Leaderboard';
    if (path === '/profile') return 'Profile';
    return 'EcoVista';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">🌿</span>
          <span className="navbar-title">EcoVista</span>
        </Link>

        <div className="navbar-center">
          <span className="page-indicator">{getPageTitle()}</span>
        </div>

        <div className="navbar-actions">
          {user && (
            <div className="user-menu">
              <Link to="/profile" className="user-avatar" title="Profile">
                {user.name?.charAt(0).toUpperCase()}
              </Link>
              <button onClick={logout} className="logout-btn" title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
