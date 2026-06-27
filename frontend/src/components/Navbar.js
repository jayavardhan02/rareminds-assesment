import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Moon, Sun, LayoutDashboard, Plus, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Task Manager
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {user?.username} ({user?.role})
            </span>

            {user?.role === 'manager' && (
              <button
                onClick={() => navigate('/tasks/new')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg transition text-sm lg:text-base"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Task</span>
              </button>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <LayoutDashboard size={20} />
            </button>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-800'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center space-x-2 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden pb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col space-y-3 pt-4">
              <div className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {user?.username} ({user?.role})
              </div>

              {user?.role === 'manager' && (
                <button
                  onClick={() => {
                    navigate('/tasks/new');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition mx-4"
                >
                  <Plus size={18} />
                  <span>New Task</span>
                </button>
              )}

              <button
                onClick={() => {
                  navigate('/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg mx-4 ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg mx-4 ${isDark ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-800'}`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span>Toggle Theme</span>
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg mx-4 ${isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
