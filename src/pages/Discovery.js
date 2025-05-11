import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  BookmarkIcon, 
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Discovery = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    genre: '',
    search: '',
    sort: 'newest',
    length: ''
  });
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const params = {};
        if (filters.genre) params.genre = filters.genre;
        if (filters.search) params.search = filters.search;
        if (filters.length) params.length = filters.length;
        
        const response = await axios.get('http://localhost:5000/api/books/discover', { 
          params
        });
        
        // Add book length categorization to each book
        const booksWithLengthCategory = response.data.map(book => {
          const wordCount = getWordCount(book.content);
          const charCount = getCharacterCount(book.content);
          
          const isLongBook = wordCount > 40000 || charCount > 200000;
          
          return {
            ...book,
            wordCount,
            charCount,
            bookLength: isLongBook ? 'long' : 'short'
          };
        });
        
        setBooks(booksWithLengthCategory);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err.response?.data?.message || 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookmarks = async () => {
      if (user) {
        try {
          const response = await axios.get('http://localhost:5000/api/bookmarks', {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          setBookmarkedBooks(response.data
            .filter(b => b.type === 'book')
            .map(b => b.bookId));
        } catch (err) {
          console.error('Error fetching bookmarks:', err);
        }
      }
    };

    fetchBooks();
    fetchBookmarks();
  }, [filters.genre, filters.search, filters.length, user]);

  // Helper function to calculate word count
  const getWordCount = (content) => {
    if (!content) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText;
    return text.trim() ? text.split(/\s+/).length : 0;
  };

  // Helper function to calculate character count
  const getCharacterCount = (content) => {
    if (!content) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText;
    return text.length;
  };

  useEffect(() => {
    let results = [...books];
    
    // Apply search filter
    if (filters.search) {
      const searchTerms = filters.search.toLowerCase().split(' ').filter(term => term.length > 0);
      
      results = results.filter(book => {
        return searchTerms.some(term => 
          book.title.toLowerCase().includes(term) ||
          (book.subtitle && book.subtitle.toLowerCase().includes(term)) ||
          book.description.toLowerCase().includes(term) ||
          book.User.username.toLowerCase().includes(term) ||
          book.genre.some(g => g.toLowerCase().includes(term))
        );
      });
    }
    
    // Apply length filter
    if (filters.length) {
      results = results.filter(book => book.bookLength === filters.length);
    }
    
    // Apply sorting
    switch(filters.sort) {
      case 'price-asc':
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'a-z':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        results.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'random':
        // Fisher-Yates shuffle algorithm for randomization
        for (let i = results.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [results[i], results[j]] = [results[j], results[i]];
        }
        break;
      case 'newest':
      default:
        // Default sorting - prioritize long books at the top
        if (!filters.length) {
          results.sort((a, b) => {
            // First sort by book length (long books first)
            if (a.bookLength === 'long' && b.bookLength !== 'long') return -1;
            if (a.bookLength !== 'long' && b.bookLength === 'long') return 1;
            // Then sort by date (newest first) for books of the same length
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        }
        break;
    }
    
    setDisplayedBooks(results);
    
    // Update active filters
    const newActiveFilters = [];
    if (filters.genre) newActiveFilters.push({ type: 'genre', value: filters.genre });
    if (filters.search) newActiveFilters.push({ type: 'search', value: filters.search });
    if (filters.length) newActiveFilters.push({ type: 'length', value: filters.length === 'long' ? 'Long Books' : 'Short Books' });
    setActiveFilters(newActiveFilters);
    
  }, [books, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const removeFilter = (filterType) => {
    setFilters(prev => ({ ...prev, [filterType]: '' }));
  };

  const clearAllFilters = () => {
    setFilters({
      genre: '',
      search: '',
      sort: 'newest',
      length: ''
    });
  };

  const randomizeBooks = () => {
    setFilters(prev => ({ ...prev, sort: 'random' }));
  };

  const toggleBookmark = async (bookId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    try {
      if (bookmarkedBooks.includes(bookId)) {
        const response = await axios.get('http://localhost:5000/api/bookmarks', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        const bookmark = response.data.find(b => b.bookId === bookId && b.type === 'book');
        
        if (bookmark) {
          await axios.delete(`http://localhost:5000/api/bookmarks/${bookmark.id}`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          setBookmarkedBooks(bookmarkedBooks.filter(id => id !== bookId));
        }
      } else {
        await axios.post('http://localhost:5000/api/bookmarks', { 
          bookId,
          type: 'book'
        }, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setBookmarkedBooks([...bookmarkedBooks, bookId]);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-amber-800 to-amber-700 text-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              Explore Our Library
            </h1>
            <p className="mt-4 text-lg text-amber-100">
              Discover stories that resonate with your soul, from epic novels to short tales
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-amber-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title, author, genre, or keyword..."
                  className="w-full border border-amber-300 bg-white rounded-sm py-3 pl-10 pr-3 text-amber-900 placeholder-amber-400 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="w-full md:w-36">
                <select
                  name="genre"
                  value={filters.genre}
                  onChange={handleFilterChange}
                  className="w-full border border-amber-300 bg-white rounded-sm py-3 px-3 text-amber-900 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">All Genres</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Romance">Romance</option>
                  <option value="Horror">Horror</option>
                  <option value="Biography">Biography</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Investigative">Investigative</option>
                </select>
              </div>
              <div className="w-full md:w-48">
                <select
                  name="length"
                  value={filters.length}
                  onChange={handleFilterChange}
                  className="w-full border border-amber-300 bg-white rounded-sm py-3 px-3 text-amber-900 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">All Lengths</option>
                  <option value="long">Long Books</option>
                  <option value="short">Short Books</option>
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={randomizeBooks}
                className="w-full md:w-auto px-6 py-3 bg-amber-200 text-amber-900 rounded-sm hover:bg-amber-300 flex items-center justify-center gap-2 shadow-sm transition-all duration-300"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
                Randomize
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sorting and Active Filters */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            {activeFilters.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-sm text-amber-700 flex items-center">
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  Filters:
                </span>
                {activeFilters.map((filter, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>
                      {filter.type === 'genre' ? `Genre: ${filter.value}` : 
                       filter.type === 'length' ? `Length: ${filter.value}` : 
                       `"${filter.value}"`}
                    </span>
                    <button 
                      onClick={() => removeFilter(filter.type)}
                      className="ml-2 text-amber-600 hover:text-amber-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-amber-600 hover:text-amber-800 ml-2 underline font-medium"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-amber-700">Sort by:</span>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="border border-amber-200 bg-white rounded-sm py-2 px-3 text-amber-900 text-sm shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="a-z">Title: A to Z</option>
              <option value="z-a">Title: Z to A</option>
              <option value="random">Random</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center border-b border-amber-200 pb-4">
          <p className="text-amber-700">
            Showing <span className="font-medium">{displayedBooks.length}</span> {displayedBooks.length === 1 ? 'book' : 'books'}
          </p>
          {user && (
            <Link 
              to="/library" 
              className="text-amber-700 hover:text-amber-900 flex items-center gap-1 font-medium"
            >
              <BookmarkIcon className="h-4 w-4" />
              View Your Library
            </Link>
          )}
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 space-y-6 py-1">
                  <div className="h-64 bg-amber-200 rounded-sm"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-amber-200 rounded"></div>
                    <div className="h-4 bg-amber-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-amber-100 rounded-sm border-l-4 border-amber-400 max-w-md mx-auto">
            <p className="text-amber-800">{error}</p>
            {!user && (
              <p className="mt-2 text-amber-700">
                You may need to <Link to="/login" className="text-amber-600 font-medium hover:underline">log in</Link> to access this content.
              </p>
            )}
          </div>
        ) : displayedBooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-sm shadow-sm border border-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-4 text-lg font-serif font-medium text-amber-900">No books found</h3>
            <p className="mt-2 text-amber-700">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {displayedBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className="absolute -inset-1 bg-amber-200 rounded-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  
                  <div className="relative h-full bg-white rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="relative h-64 overflow-hidden">
                      {book.coverImage ? (
                        <img 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          src={book.coverImage} 
                          alt={book.title} 
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1 text-amber-600" />
                        <span>{book.bookLength === 'long' ? 'Long read' : 'Quick read'}</span>
                      </div>
                      
                      {book.isMonetized && (
                        <div className="absolute bottom-3 right-3 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                          ${book.price}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-serif font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-sm text-amber-600 mt-1">
                            by{' '}
                            <Link 
                              to={`/user/${book.User.username}`}
                              className="hover:text-amber-800 hover:underline transition-colors"
                            >
                              {book.User.username}
                            </Link>
                          </p>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            toggleBookmark(book.id);
                          }}
                          className={`p-2 rounded-full ${bookmarkedBooks.includes(book.id) 
                            ? 'text-amber-600 hover:text-amber-700' 
                            : 'text-amber-400 hover:text-amber-600'
                          } transition-colors`}
                        >
                          <BookmarkIcon className={`h-5 w-5 ${bookmarkedBooks.includes(book.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      {book.subtitle && (
                        <p className="mt-2 text-sm text-amber-700 italic">{book.subtitle}</p>
                      )}
                      
                      <p className="mt-3 text-amber-800 line-clamp-3 text-sm leading-relaxed">
                        {book.description || "A captivating story waiting to be discovered..."}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {book.genre.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-amber-100 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
                            onClick={() => setFilters(prev => ({ ...prev, genre: tag }))}
                          >
                            {tag}
                          </span>
                        ))}
                        {book.genre.length > 3 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-amber-50 text-amber-500">
                            +{book.genre.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-amber-100 flex justify-between items-center">
                        <div className="text-xs text-amber-500">
                          {book.wordCount.toLocaleString()} words
                        </div>
                        <Link 
                          to={`/book/${book.id}`}
                          className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-900 group transition-colors"
                        >
                          Read this story
                          <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Final CTA */}
      <div className="bg-amber-800 text-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold">
              Found Something You Like?
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-amber-100">
              Save your favorite stories to your personal library and continue your literary journey anytime, anywhere.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/library"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm shadow-lg text-amber-900 bg-amber-200 hover:bg-amber-300 transition-colors"
                  >
                    <BookmarkIcon className="mr-2 h-5 w-5" />
                    View Your Library
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm shadow-lg text-amber-900 bg-amber-200 hover:bg-amber-300 transition-colors"
                  >
                    Join Our Community
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Discovery;