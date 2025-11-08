import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold">
              VoteSystem
            </Link>
            
            {isAuthenticated && (
              <div className="flex space-x-4">
                {isSuperAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition ${isActive('/admin')}`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/vote"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition ${isActive('/vote')}`}
                >
                  Vote
                </Link>
                <Link
                  to="/results"
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition ${isActive('/results')}`}
                >
                  Results
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">
                  Welcome, <span className="font-semibold">{user?.username}</span>
                  {isSuperAdmin && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;