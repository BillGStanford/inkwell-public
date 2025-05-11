import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Icons
import { 
  BookOpenIcon, 
  BookmarkIcon, 
  XMarkIcon, 
  ArrowPathIcon, 
  ArrowRightIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Empty state component for better reusability
const EmptyState = ({ type, message, suggestion }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 bg-white rounded-sm shadow-md border border-amber-100"
  >
    {type === 'books' ? 
      <BookOpenIcon className="h-16 w-16 text-amber-200 mb-4" /> : 
      <BookmarkIcon className="h-16 w-16 text-amber-200 mb-4" />
    }
    <p className="text-lg font-medium text-amber-900 mb-2">{message}</p>
    <p className="text-sm text-amber-600 max-w-md text-center">{suggestion}</p>
  </motion.div>
);

// BookmarkCard component for displaying individual bookmarks
const BookmarkCard = ({ bookmark, onRemove }) => {
  const { Book } = bookmark;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-amber-200 rounded-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      
      <div className="relative bg-white rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden">
        <div className="relative group">
          <Link to={`/book/${Book.id}`} className="block">
            {Book?.coverImage ? (
              <div className="h-52 overflow-hidden">
                <img 
                  src={Book.coverImage} 
                  alt={Book.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="h-52 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <BookOpenIcon className="h-16 w-16 text-amber-400" />
              </div>
            )}
            
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(bookmark.id);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full shadow hover:shadow-md transition-all duration-200 text-amber-400 hover:text-amber-700"
                aria-label="Remove bookmark"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </Link>
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-lg font-serif font-bold line-clamp-1 mb-1 text-amber-900">
            <Link to={`/book/${Book.id}`} className="hover:text-amber-700 transition-colors">
              {Book?.title || 'Untitled Book'}
            </Link>
          </h2>
          
          {bookmark.type === 'page' && (
            <p className="text-sm font-medium text-amber-600 mb-2">
              Page {bookmark.pageIndex + 1}
            </p>
          )}
          
          <div className="text-sm text-amber-600 mb-4">
            by <span className="text-amber-800">{Book?.User?.username || 'Unknown author'}</span>
          </div>
          
          <div className="mt-auto pt-4 border-t border-amber-100">
            {bookmark.type === 'page' ? (
              <Link 
                to={`/book/${Book.id}?page=${bookmark.pageIndex}`}
                className="flex items-center justify-end text-sm font-medium text-amber-700 hover:text-amber-900 group transition-colors"
              >
                Continue reading
                <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                to={`/book/${Book.id}`}
                className="flex items-center justify-end text-sm font-medium text-amber-700 hover:text-amber-900 group transition-colors"
              >
                View book
                <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Tab button component
const TabButton = ({ active, icon, children, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center px-5 py-3 font-medium text-sm transition-all duration-200
      ${active ? 
        'border-b-2 border-amber-500 text-amber-800' : 
        'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
      }
    `}
  >
    {icon}
    <span className="ml-2">{children}</span>
  </button>
);

const Library = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('books');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/bookmarks', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setBookmarks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err.response?.data?.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const removeBookmark = async (bookmarkId) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookmarks/${bookmarkId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError(err.response?.data?.message || 'Failed to remove bookmark');
    }
  };

  // Filter bookmarks based on type and search term
  const filteredBookmarks = bookmarks.filter(b => {
    const matchesType = activeTab === 'books' ? b.type === 'book' : b.type === 'page';
    const matchesSearch = searchTerm.trim() === '' || 
      b.Book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.Book?.User?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Render different states
  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-amber-800 text-center p-6 bg-amber-100 rounded-sm border border-amber-200 shadow-sm">
            <p className="text-lg font-medium mb-3">{error}</p>
            <button 
              onClick={fetchBookmarks} 
              className="inline-flex items-center px-4 py-2 bg-white border border-amber-200 rounded-sm text-amber-700 hover:bg-amber-50 transition-colors shadow-sm"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-sm shadow-md border border-amber-100"
          >
            <UserIcon className="h-16 w-16 text-amber-300 mb-4 mx-auto" />
            <h2 className="text-xl font-serif font-bold text-amber-900 mb-2">Authentication Required</h2>
            <p className="text-amber-700 mb-6 max-w-md mx-auto">
              Please log in to view and manage your personal library
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-sm text-white font-medium transition-colors shadow-md"
            >
              Log in to continue
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="mb-4 md:mb-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 mb-2">
              <BookmarkIcon className="h-4 w-4 mr-2" />
              Personal Collection
            </div>
            <h1 className="text-3xl font-serif font-bold text-amber-900">My Library</h1>
          </div>
          
          {/* Search field */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-amber-400" />
            </div>
            <input
              type="text"
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-amber-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-sm shadow-md border border-amber-100 mb-8"
        >
          <div className="flex border-b border-amber-100">
            <TabButton 
              active={activeTab === 'books'} 
              icon={<BookOpenIcon className="h-4 w-4" />}
              onClick={() => setActiveTab('books')}
            >
              Saved Books
            </TabButton>
            <TabButton 
              active={activeTab === 'pages'} 
              icon={<BookmarkIcon className="h-4 w-4" />}
              onClick={() => setActiveTab('pages')}
            >
              Saved Pages
            </TabButton>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {filteredBookmarks.length === 0 ? (
                searchTerm ? (
                  <EmptyState 
                    type={activeTab}
                    message="No results found"
                    suggestion="Try a different search term or clear your search"
                  />
                ) : (
                  <EmptyState 
                    type={activeTab}
                    message={`No ${activeTab === 'books' ? 'saved books' : 'saved pages'} yet`}
                    suggestion={activeTab === 'books' 
                      ? 'Save books from the discovery page to see them here.' 
                      : 'Bookmark pages while reading to save them here.'}
                  />
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBookmarks.map(bookmark => (
                    <BookmarkCard 
                      key={bookmark.id} 
                      bookmark={bookmark} 
                      onRemove={removeBookmark} 
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Empty bottom space for aesthetic */}
        <div className="mb-16"></div>
      </div>
    </div>
  );
};

export default Library;