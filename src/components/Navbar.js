import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;
  
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <nav className="bg-amber-900 text-amber-50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <BookOpenIcon className="h-8 w-auto text-amber-200" />
              <span className="ml-2 font-serif font-bold text-xl">INKWELL</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`${isActive('/') 
                  ? 'border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:text-white hover:border-amber-300'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Home
              </Link>
              <Link 
                to="/discover" 
                className={`${isActive('/discover') 
                  ? 'border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:text-white hover:border-amber-300'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Discover
              </Link>
              <Link 
                to="/library" 
                className={`${isActive('/library') 
                  ? 'border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:text-white hover:border-amber-300'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Library
              </Link>
              <Link 
                to="/writing" 
                className={`${isActive('/writing') 
                  ? 'border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:text-white hover:border-amber-300'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Write
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-amber-300" />
              </div>
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-amber-700 rounded-sm leading-5 bg-amber-800 placeholder-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-amber-50 sm:text-sm"
              />
            </form>
            
            {user ? (
              <>
                <div className="ml-3 relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className="max-w-xs bg-amber-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center">
                      {user.avatarUrl ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.avatarUrl}
                          alt={user.username}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-amber-200 font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <ChevronDownIcon className={`ml-1 h-4 w-4 text-amber-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-sm shadow-lg py-1 bg-amber-800 ring-1 ring-amber-700 focus:outline-none z-50"
                        role="menu"
                      >
                        <Link 
                          to={`/user/${user.username}`} 
                          className="block px-4 py-2 text-sm text-amber-100 hover:bg-amber-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link 
                          to="/settings" 
                          className="block px-4 py-2 text-sm text-amber-100 hover:bg-amber-700"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-amber-100 hover:bg-amber-700"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link
                  to="/writing/new"
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-amber-900 bg-amber-300 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Write
                </Link>
              </>
            ) : (
              <div className="flex space-x-4 ml-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-amber-900 bg-amber-300 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-sm"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-amber-900 bg-amber-200 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-amber-200 hover:text-white hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden bg-amber-800"
          >
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`${isActive('/') 
                  ? 'bg-amber-900 border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:bg-amber-700 hover:text-white'} 
                  block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/discover"
                className={`${isActive('/discover') 
                  ? 'bg-amber-900 border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:bg-amber-700 hover:text-white'} 
                  block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover
              </Link>
              <Link
                to="/library"
                className={`${isActive('/library') 
                  ? 'bg-amber-900 border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:bg-amber-700 hover:text-white'} 
                  block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Library
              </Link>
              <Link
                to="/writing"
                className={`${isActive('/writing') 
                  ? 'bg-amber-900 border-amber-300 text-white' 
                  : 'border-transparent text-amber-200 hover:bg-amber-700 hover:text-white'} 
                  block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Write
              </Link>
            </div>
            
            <div className="pt-2 pb-3 px-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-amber-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-amber-700 rounded-sm leading-5 bg-amber-800 placeholder-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-amber-50 sm:text-sm"
                />
              </form>
            </div>
            
            {user ? (
              <div className="pt-4 pb-3 border-t border-amber-700">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {user.avatarUrl ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatarUrl}
                        alt={user.username}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-amber-700 flex items-center justify-center text-amber-200 font-medium">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.username}</div>
                    <div className="text-sm font-medium text-amber-300">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to={`/user/${user.username}`}
                    className="block px-4 py-2 text-base font-medium text-amber-200 hover:text-white hover:bg-amber-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-base font-medium text-amber-200 hover:text-white hover:bg-amber-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-amber-200 hover:text-white hover:bg-amber-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-amber-700">
                <div className="flex items-center justify-center space-x-4 px-4">
                  <Link
                    to="/login"
                    className="w-full py-2 text-center text-sm font-medium text-amber-900 bg-amber-300 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full py-2 text-center border border-transparent text-sm font-medium rounded-sm text-amber-900 bg-amber-200 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;