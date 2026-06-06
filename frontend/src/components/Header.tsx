import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const dashboardRoute = () => {
    if (!user) return '/auth/login';
    if (user.role === 'ADMIN') return '/admin-dashboard';
    return '/dashboard';
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-all duration-200">
      <nav className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto relative">
        <div className="flex items-center">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            XYZ Homes
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              to="/buy"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`font-body-md text-body-md transition-colors ${
                isActive('/buy') ? 'text-primary border-b-2 border-primary pb-1' : 'text-secondary hover:text-primary'
              }`}
            >
              Buy
            </Link>
            <Link
              to="/rent"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`font-body-md text-body-md transition-colors ${
                isActive('/rent') ? 'text-primary border-b-2 border-primary pb-1' : 'text-secondary hover:text-primary'
              }`}
            >
              Rent
            </Link>
            <Link
              to="/sell"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`font-body-md text-body-md transition-colors ${
                isActive('/sell') ? 'text-primary border-b-2 border-primary pb-1' : 'text-secondary hover:text-primary'
              }`}
            >
              Sell
            </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
            title="Toggle Theme"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(dashboardRoute())}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant relative"
                title="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none ml-2"
                >
                <img
                  src={
                    user?.avatar ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBBlkv4g9X0XcOaOHPU9JD0I2vM7RHcaJt8rF3dK0yjBzIZ6YqZG6asDvzylsnUQUm2sjRVEb3hsx4_VBY9dsPFGZhEHF_3PIneysiJawGWGl1Twpi-w1qvFcULBccrteK0TRggRGaLOZV5w3DbxXgil4JFc_AbXVm6O0VEGBCGJ2NcylZbkTGkJCgbf5gBArmXoxywMsp82i4fJRYTslvowfYYA_vIgnHubKr24d4oSff_2Ir5t53JYbnug-els730lpGBt97ajJM'
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover"
                />
                <span className="hidden sm:inline font-label-md text-label-md text-on-background">
                  {user?.name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant/20">
                    <p className="font-bold text-sm text-on-background truncate">{user?.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                  </div>
                  <Link
                    to={dashboardRoute()}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-error hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                    Log Out
                  </button>
                </div>
              )}
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="font-label-md text-label-md text-secondary hover:text-primary px-4 py-2 rounded-lg transition-all"
              >
                Log In
              </Link>
              <Link
                to="/auth/register"
                className="font-label-md text-label-md px-6 py-2 bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-container transition-all active:scale-95 duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
