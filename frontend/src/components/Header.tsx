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
    if (user.role === 'AGENT') return '/agent-dashboard';
    return '/dashboard';
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-all duration-200">
      <nav className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            XYZ Homes
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/properties?type=Apartment"
              className={`font-body-md text-body-md transition-colors ${
                isActive('/properties') ? 'text-primary border-b-2 border-primary pb-1' : 'text-secondary hover:text-primary'
              }`}
            >
              Buy
            </Link>
            <Link
              to="/properties?type=House"
              className="font-body-md text-body-md text-secondary hover:text-primary transition-colors"
            >
              Rent
            </Link>
            <Link
              to="/properties"
              className="font-body-md text-body-md text-secondary hover:text-primary transition-colors"
            >
              Sell
            </Link>
            <Link
              to="/contact"
              className="font-body-md text-body-md text-secondary hover:text-primary transition-colors"
            >
              Agents
            </Link>
          </div>
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
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
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
                    className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'AGENT' && (
                    <Link
                      to="/agent-dashboard?tab=listings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      Create Property
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-surface-container-low transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
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
