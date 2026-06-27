import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, User, Moon, Sun, Check, X } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet all requirements');
      return;
    }

    const result = await signup(username, email, password, role);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <button
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'} shadow-lg`}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Task Manager
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Username
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="johndoe"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
                required
              />
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                <div className={`flex items-center text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordRequirements.length ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordRequirements.uppercase ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                  At least one uppercase letter
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordRequirements.lowercase ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                  At least one lowercase letter
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.number ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordRequirements.number ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                  At least one number
                </div>
                <div className={`flex items-center text-xs ${passwordRequirements.special ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordRequirements.special ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                  At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className={`mt-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
