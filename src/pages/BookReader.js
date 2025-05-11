import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet';
import BookTableOfContents from './BookTableOfContents';
import { 
  FiSun, 
  FiMoon, 
  FiBookOpen, 
  FiChevronLeft, 
  FiChevronRight, 
  FiList, 
  FiBookmark,
  FiSettings,
  FiX
} from 'react-icons/fi';

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState('medium');
  const [darkMode, setDarkMode] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [readingStarted, setReadingStarted] = useState(false);
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [pageWordCounts, setPageWordCounts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [apiBookmarks, setApiBookmarks] = useState([]);
  const [fontFamily, setFontFamily] = useState('serif');
  const [lineHeight, setLineHeight] = useState('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const pageRefs = useRef([]);
  const readerRef = useRef(null);

  const prepareBookContent = (content) => {
    if (!content) return { pages: [], wordCounts: [], total: 0 };
  
    const styledContent = content
      .replace(/<h1([^>]*)>/g, '<h1$1 class="text-3xl font-bold my-6 pb-2 border-b-2 border-primary-500">')
      .replace(/<h2([^>]*)>/g, '<h2$1 class="text-2xl font-bold my-5 pb-1 border-b border-primary-300">')
      .replace(/<h3([^>]*)>/g, '<h3$1 class="text-xl font-semibold my-4">')
      .replace(/<h4([^>]*)>/g, '<h4$1 class="text-lg font-medium my-3">')
      .replace(/<h5([^>]*)>/g, '<h5$1 class="font-medium underline my-2">')
      .replace(/<h6([^>]*)>/g, '<h6$1 class="font-medium italic my-1">')
      .replace(/<blockquote([^>]*)>/g, '<blockquote$1 class="border-l-4 border-primary-500 pl-4 my-4 italic text-gray-600 dark:text-gray-300">')
      .replace(/<ul([^>]*)>/g, '<ul$1 class="list-disc pl-6 my-4">')
      .replace(/<ol([^>]*)>/g, '<ol$1 class="list-decimal pl-6 my-4">')
      .replace(/<p class="ql-align-center"([^>]*)>/g, '<p$1 class="text-center">')
      .replace(/<p class="ql-align-right"([^>]*)>/g, '<p$1 class="text-right">')
      .replace(/<p class="ql-align-justify"([^>]*)>/g, '<p$1 class="text-justify">');

    const wordsPerPage = 350;
    const paragraphs = styledContent.split('\n\n');
    let currentPage = '';
    let currentWordCount = 0;
    const pages = [];
    const wordCounts = [];
    let total = 0;
    
    paragraphs.forEach(paragraph => {
      const textOnly = paragraph.replace(/<[^>]*>/g, ' ');
      const words = textOnly.split(/\s+/).filter(word => word.length > 0);
      const paragraphWordCount = words.length;
      
      if (currentWordCount + paragraphWordCount > wordsPerPage && currentPage !== '') {
        pages.push(currentPage);
        wordCounts.push(currentWordCount);
        total += currentWordCount;
        currentPage = paragraph;
        currentWordCount = paragraphWordCount;
      } else {
        currentPage += (currentPage ? '\n\n' : '') + paragraph;
        currentWordCount += paragraphWordCount;
      }
      
      while (currentWordCount > wordsPerPage) {
        const wordsInPage = currentPage.split(/\s+/);
        const wordsForThisPage = wordsInPage.slice(0, wordsPerPage).join(' ');
        const remainingWords = wordsInPage.slice(wordsPerPage).join(' ');
        
        pages.push(wordsForThisPage);
        wordCounts.push(wordsPerPage);
        total += wordsPerPage;
        
        currentPage = remainingWords;
        currentWordCount = remainingWords.split(/\s+/).filter(word => word.length > 0).length;
      }
    });
    
    if (currentPage) {
      pages.push(currentPage);
      wordCounts.push(currentWordCount);
      total += currentWordCount;
    }
    
    return { pages, wordCounts, total };
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/books/public/${id}`);
        const { pages, wordCounts, total } = prepareBookContent(response.data.content);
        setBook({
          ...response.data,
          pages,
          wordCounts
        });
        setTotalWordCount(total);
        setPageWordCounts(wordCounts);
        
        const savedBookmarks = JSON.parse(localStorage.getItem(`bookmarks-${id}`)) || [];
        setBookmarks(savedBookmarks);

        if (user) {
          const bookmarksResponse = await axios.get('http://localhost:5000/api/bookmarks', {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          const pageBookmarks = bookmarksResponse.data
            .filter(b => b.type === 'page' && b.bookId === id)
            .map(b => b.pageIndex);
          setApiBookmarks(pageBookmarks);
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(err.response?.data?.message || 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };
  
    fetchBook();
    pageRefs.current = Array(1000).fill().map(() => React.createRef());
  }, [id, user]);

  useEffect(() => {
    const savedPage = localStorage.getItem(`book-page-${id}`);
    if (savedPage) {
      const page = parseInt(savedPage, 10);
      if (!isNaN(page)) {
        setCurrentPage(page);
      }
    }
  }, [id, book?.pages?.length]);

  useEffect(() => {
    if (book?.pages?.length && readingStarted) {
      localStorage.setItem(`book-page-${id}`, currentPage.toString());
    }
  }, [currentPage, id, book?.pages?.length, readingStarted]);

  useEffect(() => {
    if (book?.pages?.length) {
      const newProgress = Math.round(((currentPage + 1) / book.pages.length) * 100);
      setProgress(newProgress);
    }
  }, [currentPage, book?.pages?.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrevious();
      else if (e.key === 'Escape') {
        setShowChapters(false);
        setShowSettings(false);
        if (isFullscreen) toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, book?.pages?.length, isFullscreen]);

  const handleNext = () => {
    if (currentPage + 2 < (book?.pages?.length || 0)) {
      setCurrentPage(currentPage + 2);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPage >= 2) {
      setCurrentPage(currentPage - 2);
      window.scrollTo(0, 0);
    }
  };

  const goToPage = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= book.pages.length) return;
    const adjustedIndex = Math.floor(pageIndex / 2) * 2;
    setCurrentPage(adjustedIndex);
    setShowChapters(false);
    setReadingStarted(true);
    window.scrollTo(0, 0);
  };

  const startReading = () => {
    const savedPage = localStorage.getItem(`book-page-${id}`);
    if (savedPage) {
      const page = parseInt(savedPage, 10);
      if (!isNaN(page) && page < (book?.pages?.length || 0)) {
        setCurrentPage(page);
      } else {
        setCurrentPage(0);
      }
    } else {
      setCurrentPage(0);
    }
    setReadingStarted(true);
    window.scrollTo(0, 0);
  };

  const toggleBookmark = async () => {
    try {
      const isCurrentlyBookmarked = isBookmarked();
      
      if (isCurrentlyBookmarked) {
        if (user) {
          try {
            await axios.delete(`http://localhost:5000/api/bookmarks`, {
              headers: {
                Authorization: `Bearer ${user.token}`
              },
              data: {
                bookId: id,
                type: 'page',
                pageIndex: currentPage
              }
            });
            setApiBookmarks(apiBookmarks.filter(page => page !== currentPage));
          } catch (err) {
            if (err.response?.status !== 404) {
              console.error('Error deleting bookmark:', err);
              throw err;
            }
          }
        }
        
        const newBookmarks = bookmarks.filter(page => page !== currentPage);
        setBookmarks(newBookmarks);
        localStorage.setItem(`bookmarks-${id}`, JSON.stringify(newBookmarks));
      } else {
        if (user) {
          await axios.post(
            'http://localhost:5000/api/bookmarks',
            { 
              bookId: id,
              type: 'page',
              pageIndex: currentPage 
            },
            {
              headers: {
                Authorization: `Bearer ${user.token}`
              }
            }
          );
          setApiBookmarks([...apiBookmarks, currentPage]);
        }
        
        const newBookmarks = [...bookmarks, currentPage];
        setBookmarks(newBookmarks);
        localStorage.setItem(`bookmarks-${id}`, JSON.stringify(newBookmarks));
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const isBookmarked = () => {
    return user ? apiBookmarks.includes(currentPage) : bookmarks.includes(currentPage);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Style configurations
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const fontFamilyClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  };

  const lineHeightClasses = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-md border border-red-200">
          <p>{error}</p>
          {!user && (
            <p className="mt-2 text-gray-600">
              You may need to <Link to="/login" className="text-primary-600 hover:underline">log in</Link> to access this content.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!book) {
    return <div className="text-center p-8">Book not found</div>;
  }

  if (!readingStarted) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <Helmet>
          <title>{book.title} | INKWELL</title>
          {book.description && <meta name="description" content={book.description} />}
        </Helmet>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:space-x-8">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <div className={`aspect-[2/3] ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-2xl`}>
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={`Cover for ${book.title}`} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="text-center p-4">
                    <h2 className="text-xl font-bold">{book.title}</h2>
                    <p className="mt-2">{book.User.username}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-start">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 mb-4 transition-colors"
                >
                  <FiChevronLeft className="mr-1" /> Back
                </button>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={darkMode ? 'Light mode' : 'Dark mode'}
                  >
                    {darkMode ? <FiSun /> : <FiMoon />}
                  </button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              
              <div className="flex items-center space-x-2 mb-4">
                {book.User.avatarUrl ? (
                  <img 
                    src={book.User.avatarUrl} 
                    alt={book.User.username} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-800 dark:text-primary-200 font-medium">
                    {book.User.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>
                  by <Link 
                    to={`/user/${book.User.username}`} 
                    className="hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                  >
                    {book.User.username}
                  </Link>
                </span>
              </div>
              
              {book.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{book.description}</p>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mt-2">
                  {book.genre.map((g, i) => (
                    <span 
                      key={i} 
                      className={`px-3 py-1 text-sm rounded-full ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
                
                {book.tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tags: {book.tags.join(', ')}</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Words</span>
                    <p className="font-semibold">{totalWordCount.toLocaleString()}</p>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Pages</span>
                    <p className="font-semibold">{book.pages?.length || 0}</p>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Published</span>
                    <p className="font-semibold">{new Date(book.publishedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={startReading}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg font-medium flex items-center"
              >
                Start Reading <FiBookOpen className="ml-2" />
              </button>
            </div>
          </div>
          
          <div className="mt-12">
            <BookTableOfContents 
              bookContent={book.content} 
              onChapterClick={goToPage}
              darkMode={darkMode}
              wordCounts={pageWordCounts}
              contentPages={book.pages}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`} 
      ref={readerRef}
    >
      <Helmet>
        <title>{`${book.title} - Page ${currentPage + 1} | INKWELL`}</title>
        {book.description && <meta name="description" content={book.description} />}
      </Helmet>

      {/* Reading Header */}
      <div className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 flex justify-between items-center shadow-md transition-all duration-300 ${isFullscreen ? 'opacity-0 hover:opacity-100' : ''}`}>
        <button 
          onClick={() => setReadingStarted(false)}
          className="flex items-center px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FiChevronLeft className="mr-1" /> Contents
        </button>
        
        <div className="flex-1 px-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
            Pages {currentPage + 1}-{Math.min(currentPage + 2, book.pages.length)} of {book.pages.length} ({progress}%)
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <FiSettings />
          </button>
          
          <button 
            onClick={toggleBookmark}
            className={`p-2 rounded-full transition-colors ${isBookmarked() 
              ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            title={isBookmarked() ? 'Remove bookmark' : 'Add bookmark'}
          >
            <FiBookmark className={isBookmarked() ? 'fill-current' : ''} />
          </button>
          
          <button 
            onClick={() => setShowChapters(!showChapters)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Table of Contents"
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`fixed top-16 right-4 z-30 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Reading Settings</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Text Size</h3>
              <div className="flex gap-2">
                {['small', 'medium', 'large', 'xlarge'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-3 py-1 rounded ${fontSize === size ? 
                      (darkMode ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-800') : 
                      (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Font Family</h3>
              <div className="flex gap-2">
                {['serif', 'sans', 'mono'].map((family) => (
                  <button
                    key={family}
                    onClick={() => setFontFamily(family)}
                    className={`px-3 py-1 rounded ${fontFamily === family ? 
                      (darkMode ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-800') : 
                      (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
                  >
                    {family.charAt(0).toUpperCase() + family.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Line Height</h3>
              <div className="flex gap-2">
                {['tight', 'normal', 'relaxed', 'loose'].map((height) => (
                  <button
                    key={height}
                    onClick={() => setLineHeight(height)}
                    className={`px-3 py-1 rounded ${lineHeight === height ? 
                      (darkMode ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-800') : 
                      (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
                  >
                    {height.charAt(0).toUpperCase() + height.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <FiSun /> : <FiMoon />}
              </button>
              <span className="ml-2 text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="w-full py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </button>
          </div>
        </div>
      )}

      {/* Chapter Navigation */}
      {showChapters && (
        <div className={`fixed inset-0 z-30 ${darkMode ? 'bg-gray-900' : 'bg-white'} p-8 overflow-y-auto`}>
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Table of Contents</h2>
              <button 
                onClick={() => setShowChapters(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX />
              </button>
            </div>
            <BookTableOfContents 
              bookContent={book.content} 
              onChapterClick={goToPage}
              darkMode={darkMode}
              wordCounts={pageWordCounts}
              contentPages={book.pages}
              bookmarks={bookmarks}
            />
          </div>
        </div>
      )}

      {/* Main Reading Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className={`${fontSizeClasses[fontSize]} ${fontFamilyClasses[fontFamily]} ${lineHeightClasses[lineHeight]} leading-relaxed`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Page */}
            <div 
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl`}
              onClick={() => currentPage >= 2 && handlePrevious()}
            >
              {currentPage < book.pages.length && (
                <>
                  <div 
                    ref={el => pageRefs.current[currentPage] = el}
                    className="prose dark:prose-invert prose-p:my-4 max-w-none min-h-[60vh]"
                    dangerouslySetInnerHTML={{ __html: book.pages[currentPage] }}
                  />
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                    <span>Page {currentPage + 1}</span>
                    <div className="flex items-center">
                      <span className="mr-2">{pageWordCounts[currentPage] || 0} words</span>
                      {isBookmarked() && (
                        <FiBookmark className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Right Page */}
            <div 
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl`}
              onClick={() => currentPage + 2 < book.pages.length && handleNext()}
            >
              {currentPage + 1 < book.pages.length && (
                <>
                  <div 
                    ref={el => pageRefs.current[currentPage + 1] = el}
                    className="prose dark:prose-invert max-w-none min-h-[60vh]"
                    dangerouslySetInnerHTML={{ __html: book.pages[currentPage + 1] }}
                  />
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                    <span>Page {currentPage + 2}</span>
                    <div className="flex items-center">
                      <span className="mr-2">{pageWordCounts[currentPage + 1] || 0} words</span>
                      {isBookmarked() && (
                        <FiBookmark className="text-yellow-500" />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className={`fixed bottom-0 left-0 right-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-lg transition-all duration-300 ${isFullscreen ? 'opacity-0 hover:opacity-100' : ''}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className={`flex items-center px-4 py-2 rounded-lg ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} transition-colors`}
          >
            <FiChevronLeft className="mr-1" /> Previous
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            <span>Pages {currentPage + 1}-{Math.min(currentPage + 2, book.pages.length)} of {book.pages.length}</span>
          </div>
          
          <button
            onClick={handleNext}
            disabled={currentPage + 2 >= book.pages.length}
            className={`flex items-center px-4 py-2 rounded-lg ${currentPage + 2 >= book.pages.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} transition-colors`}
          >
            Next <FiChevronRight className="ml-1" />
          </button>
        </div>
      </div>

      {/* Book Metadata Footer */}
      {!isFullscreen && (
        <div className={`mt-12 py-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <div className="flex items-center space-x-4 mb-4">
              {book.User.avatarUrl ? (
                <img 
                  src={book.User.avatarUrl} 
                  alt={book.User.username} 
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-800 dark:text-primary-200 font-medium">
                  {book.User.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-medium">
                  <Link 
                    to={`/user/${book.User.username}`} 
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {book.User.username}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Published on {new Date(book.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {book.genre.map((g, i) => (
                <span 
                  key={i} 
                  className={`px-3 py-1 text-sm rounded-full ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookReader;