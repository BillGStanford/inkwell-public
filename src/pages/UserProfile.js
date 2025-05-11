import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatDistance } from 'date-fns';

const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [publishedBooks, setPublishedBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setLoadingProgress(30);
        
        const response = await axios.get(
          `http://localhost:5000/api/users/profile/${username}`,
          { 
            timeout: 5000,
            onDownloadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 100000)
              );
              setLoadingProgress(Math.min(30 + percentCompleted * 0.7, 95));
            }
          }
        );
        
        setProfile(response.data);
        setError(null);
        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 300);
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        if (err.response) {
          if (err.response.status === 404) {
            setError(`User "${username}" not found`);
          } else {
            setError(`Server error: ${err.response.status}`);
          }
        } else if (err.request) {
          setError('No response from server. Please check if the API server is running.');
        } else {
          setError(`Request error: ${err.message}`);
        }
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  useEffect(() => {
    const fetchPublishedBooks = async () => {
      if (!profile || !profile.id) return;
      
      try {
        setBooksLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/books/user/${profile.id}`,
          { timeout: 5000 }
        );
        setPublishedBooks(response.data);
        setBooksError(null);
      } catch (err) {
        console.error('Error fetching published books:', err);
        setBooksError('Failed to load published books');
      } finally {
        setBooksLoading(false);
      }
    };
    
    fetchPublishedBooks();
  }, [profile]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })} (${formatDistance(date, new Date(), { addSuffix: true })})`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-6">
        <div className="w-full max-w-md text-center">
          <div className="relative h-32 w-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-amber-200 rounded-lg shadow-md animate-pulse" style={{
              animationDuration: '2s'
            }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-16 w-16 text-amber-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
          
          <div className="w-full bg-amber-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-amber-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <h3 className="text-lg font-medium text-amber-800 mb-2">
            {loadingProgress < 30 ? "Finding this reader..." : 
             loadingProgress < 70 ? "Gathering their books..." : 
             "Almost ready..."}
          </h3>
          <p className="text-amber-600 text-sm">
            {loadingProgress < 30 ? "Searching our library records" : 
             loadingProgress < 70 ? "Checking their bookshelf" : 
             "Preparing your reading experience"}
          </p>
          
          {loadingProgress > 10 && loadingProgress < 90 && (
            <p className="text-amber-500 text-xs mt-4">
              Estimated time: {Math.max(1, Math.round((100 - loadingProgress)/10))}s
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">{error || 'User not found'}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please check the username and try again.</p>
              </div>
              <div className="mt-4">
                <Link to="/" className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition">
                  Return to home page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.username === profile.username;

  return (
    <div className="bg-amber-50 min-h-screen">
      {/* Profile Header with proper spacing */}
      <div className="relative bg-gradient-to-b from-amber-400 to-amber-600 pt-16 pb-16 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end">
            <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={`${profile.username}'s avatar`} 
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg hover:rotate-2 transition-transform duration-300"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-4xl font-bold text-amber-800">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-3xl font-bold text-white drop-shadow-md">
                {profile.username}
                {isOwnProfile && (
                  <span className="ml-3 text-sm bg-white text-amber-600 px-3 py-1 rounded-full shadow-sm">
                    That's you!
                  </span>
                )}
              </h1>
              
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                {profile.location && (
                  <p className="text-amber-100 flex items-center text-sm">
                    <svg className="h-5 w-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {profile.location}
                  </p>
                )}
                
                <p className="text-amber-100 flex items-center text-sm">
                  <svg className="h-5 w-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Joined {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </div>
          
          {isOwnProfile && (
            <div className="mt-8 flex justify-center md:justify-start">
              <Link 
                to="/settings" 
                className="flex items-center bg-white text-amber-700 px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-amber-50 transition-all duration-300"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content with proper spacing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-amber-100">
          {/* Bio Section */}
          <div className="p-6 border-b border-amber-100">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-2 rounded-lg mr-3">
                <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-amber-900">About</h2>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <p className="text-amber-800">
                {profile.bio || (
                  <span className="text-amber-600 italic">
                    {isOwnProfile ? "You haven't added a bio yet. Let others know about your reading tastes!" : "This book lover hasn't shared a bio yet."}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="p-6 border-b border-amber-100">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-2 rounded-lg mr-3">
                <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-amber-900">Connect</h2>
            </div>
            
            {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(profile.socialLinks).map(([platform, url]) => (
                  <a 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 text-amber-800 transition hover:shadow-sm"
                  >
                    <span className="capitalize font-medium">{platform}</span>
                    <svg className="h-4 w-4 ml-auto text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 text-center">
                <svg className="h-12 w-12 mx-auto text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="mt-2 text-amber-600">
                  {isOwnProfile ? "Add your social links to connect with other readers" : "No social links provided"}
                </p>
              </div>
            )}
          </div>

          {/* Published Books Section with proper spacing */}
          <div className="p-6 mt-4">
            <div className="flex items-center mb-6">
              <div className="bg-amber-100 p-2 rounded-lg mr-3">
                <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-amber-900">
                Published Works
                <span className="ml-3 bg-amber-100 text-amber-800 text-sm px-2.5 py-0.5 rounded-full">
                  {publishedBooks.length}
                </span>
              </h2>
            </div>
            
            {booksLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : booksError ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600">
                <p>{booksError}</p>
              </div>
            ) : publishedBooks.length === 0 ? (
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 text-center">
                <svg className="h-12 w-12 mx-auto text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="mt-2 text-amber-600">
                  {isOwnProfile ? "You haven't published any books yet. Start your writing journey today!" : "This reader hasn't published any books yet."}
                </p>
                {isOwnProfile && (
                  <Link 
                    to="/writing" 
                    className="mt-4 inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition shadow-sm"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Book
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {publishedBooks.map(book => (
                  <Link 
                    key={book.id} 
                    to={`/book/${book.id}`}
                    className="group transform hover:-translate-y-1 transition duration-300"
                  >
                    <div className="bg-white border border-amber-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md h-full flex flex-col">
                      <div className="h-48 bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden">
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage} 
                            alt={`Cover for ${book.title}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-300 to-amber-500">
                            <span className="text-white font-bold text-xl text-center px-4">{book.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow">
                        <h3 className="font-semibold text-amber-900 group-hover:text-amber-600 transition mb-1">
                          {book.title}
                        </h3>
                        {book.subtitle && (
                          <p className="text-sm text-amber-700 mb-2 line-clamp-2">{book.subtitle}</p>
                        )}
                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {book.genre.slice(0, 3).map((genre, index) => (
                              <span 
                                key={index}
                                className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-amber-500">
                            <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Published {formatDate(book.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;