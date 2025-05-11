import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  BookmarkIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  
  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get('http://localhost:5000/api/books/discover', {
          params: { seed: today }
        });
        
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
        
        const randomizedBooks = shuffleArray(booksWithLengthCategory).slice(0, 3);
        setFeaturedBooks(randomizedBooks);
      } catch (err) {
        console.error('Error fetching featured books:', err);
        setError(err.response?.data?.message || 'Failed to fetch featured books');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookmarks = async () => {
      if (user) {
        try {
          const response = await axios.get('http://localhost:5000/api/bookmarks', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setBookmarkedBooks(response.data
            .filter(b => b.type === 'book')
            .map(b => b.bookId));
        } catch (err) {
          console.error('Error fetching bookmarks:', err);
        }
      }
    };
    
    fetchFeaturedBooks();
    fetchBookmarks();
  }, [user]);

  const getWordCount = (content) => {
    if (!content) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText;
    return text.trim() ? text.split(/\s+/).length : 0;
  };

  const getCharacterCount = (content) => {
    if (!content) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText;
    return text.length;
  };
  
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  const toggleBookmark = async (bookId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    try {
      if (bookmarkedBooks.includes(bookId)) {
        const response = await axios.get('http://localhost:5000/api/bookmarks', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        const bookmark = response.data.find(b => b.bookId === bookId && b.type === 'book');
        
        if (bookmark) {
          await axios.delete(`http://localhost:5000/api/bookmarks/${bookmark.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setBookmarkedBooks(bookmarkedBooks.filter(id => id !== bookId));
        }
      } else {
        await axios.post('http://localhost:5000/api/bookmarks', { 
          bookId,
          type: 'book'
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
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
      <div className="relative bg-gradient-to-b from-amber-900 to-amber-800 text-amber-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-24 md:py-32 lg:py-40">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
                <span className="block">Where Stories</span>
                <span className="block text-amber-200">Find Their Voice</span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mt-6 text-lg md:text-xl font-light max-w-2xl leading-relaxed"
              >
                A sanctuary for writers and readers alike. Publish your literary works with elegance 
                and discover hidden gems from talented authors worldwide.
              </motion.p>
              
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/writing"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm shadow-lg text-amber-900 bg-amber-200 hover:bg-amber-300 transition-all duration-300"
                  >
                    <PencilSquareIcon className="mr-2 h-5 w-5" />
                    Begin Writing
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/discover"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-amber-200 text-base font-medium rounded-sm text-amber-100 hover:bg-amber-700 hover:bg-opacity-30 transition-all duration-300"
                  >
                    <BookOpenIcon className="mr-2 h-5 w-5" />
                    Explore Library
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 to-transparent"></div>
      </div>

      {/* Featured Books Section */}
      <div className="relative py-16 sm:py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 mb-4">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Curated Selection
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-900">
              Today's Featured Reads
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-amber-700">
              Handpicked stories that our editors believe you'll love
            </p>
          </motion.div>

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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              <AnimatePresence>
                {featuredBooks.length > 0 ? featuredBooks.map((book) => (
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
                              className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-amber-100 text-amber-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-amber-100 flex justify-end">
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
                )) : (
                  <div className="col-span-3 text-center py-12">
                    <div className="max-w-md mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-amber-900">No featured books today</h3>
                      <p className="mt-2 text-amber-700">Our library is being updated with fresh content.</p>
                      <Link 
                        to="/discover" 
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Browse All Books
                      </Link>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Link 
              to="/discover" 
              className="inline-flex items-center px-6 py-3 border border-amber-300 text-base font-medium rounded-sm text-amber-700 bg-white hover:bg-amber-50 shadow-sm transition-colors"
            >
              View Complete Library
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Author's Section */}
      <div className="bg-amber-900 text-amber-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold">
                  <span className="block">For the Storytellers</span>
                  <span className="block text-amber-200 mt-2">And Dream Weavers</span>
                </h2>
                <p className="mt-6 text-lg text-amber-100 leading-relaxed">
                  Whether you're crafting your first tale or your twentieth masterpiece, 
                  our platform provides the perfect environment for your creativity to flourish.
                </p>
                <div className="mt-8">
                  <Link
                    to="/writing/new"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-sm shadow-lg text-amber-900 bg-amber-200 hover:bg-amber-300 transition-colors"
                  >
                    <PencilSquareIcon className="mr-2 h-5 w-5" />
                    Begin Your Writing Journey
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white bg-opacity-10 p-8 rounded-sm border border-amber-700 border-opacity-30"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-amber-700 rounded-sm p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-amber-50">Writer's Workshop</h3>
                    <p className="mt-2 text-sm text-amber-100">
                      Access our collection of writing resources, from style guides to publishing tips, 
                      all designed to help you refine your craft.
                    </p>
                  </div>
                </div>
              
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-amber-800 text-amber-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Ready to Begin Your Literary Adventure?
            </h2>
            <p className="mt-6 text-lg max-w-3xl mx-auto text-amber-100 leading-relaxed">
              Join thousands of writers and readers in a community dedicated to the art of storytelling. 
              Whether you're here to create or to discover, your journey starts now.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;