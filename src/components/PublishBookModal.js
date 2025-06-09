import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Info, AlertCircle } from 'lucide-react';

const BANNED_TITLE_PHRASES = [
  "READ THIS NOW!",
  "You won't believe...",
  "Shocking secret",
  "This will blow your mind",
  "Must read!",
  "What happens next will shock you",
  "Top 10 reasons",
  "The ultimate guide",
  "Don't miss this",
  "Guaranteed results",
  "Click here",
  "Buy now",
  "MUST READ THIS NOW!",
  "FREE GIFT",
  "Limited time offer",
  "Act fast",
  "Last chance",
  "Exclusive deal",
  "Unbelievable offer",
];

const MIN_CHARACTER_COUNT = 5000;
const MAX_BOOKS_PER_DAY = 2;

const PublishBookModal = ({ bookId, bookDetails, onClose, onSuccess }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [publishLimit, setPublishLimit] = useState({ count: 0, remaining: MAX_BOOKS_PER_DAY });
  const [bookLengthInfo, setBookLengthInfo] = useState({ type: '', wordCount: 0, charCount: 0 });
  const [publishData, setPublishData] = useState({
    subtitle: bookDetails.subtitle || '',
    synopsis: bookDetails.synopsis || '',
    genre: bookDetails.genre || [],
    tags: bookDetails.tags || [],
    language: bookDetails.language || 'English',
    license: bookDetails.license || 'All rights reserved',
    isMonetized: bookDetails.isMonetized || false,
    price: bookDetails.price || 0
  });
  const [inputTag, setInputTag] = useState('');

  const genres = [
    'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 
    'Thriller', 'Romance', 'Horror', 'Biography', 'History', 
    'Self-Help', 'Poetry', 'Drama', 'Comedy', 'Adventure', 'Investigative'
  ];

  const hasBannedTitle = (title) => {
    const lowerTitle = title.toLowerCase();
    return BANNED_TITLE_PHRASES.some(phrase => 
      lowerTitle.includes(phrase.toLowerCase())
    );
  };

  useEffect(() => {
    const fetchPublishLimit = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/books/publish-limit', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPublishLimit(response.data);
      } catch (err) {
        console.error('Error fetching publish limit:', err);
      }
    };

    fetchPublishLimit();

    if (bookDetails.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = bookDetails.content;
      const text = tempDiv.textContent || tempDiv.innerText;
      
      const wordCount = text.trim() ? text.split(/\s+/).length : 0;
      const charCount = text.length;
      const isLongBook = wordCount > 40000 || charCount > 200000;
      
      setBookLengthInfo({
        type: isLongBook ? 'long' : 'short',
        wordCount,
        charCount
      });
    }
  }, [bookDetails.content]);

  const handlePublishChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPublishData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenreToggle = (genre) => {
    setPublishData(prev => {
      const newGenres = prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre];
      return { ...prev, genre: newGenres };
    });
  };

  const handleTagKeyDown = (e) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      const newTag = inputTag.trim();
      if (newTag && !publishData.tags.includes(newTag)) {
        setPublishData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        setInputTag('');
      }
    }
  };

  const handleTagChange = (e) => {
    setInputTag(e.target.value);
  };

  const removeTag = (tagToRemove) => {
    setPublishData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePublish = async () => {
    if (hasBannedTitle(bookDetails.title)) {
      setError('Your title contains phrases that are not allowed. Please choose a different title.');
      return;
    }

    if (bookLengthInfo.charCount < MIN_CHARACTER_COUNT) {
      setError(`Your book must be at least ${MIN_CHARACTER_COUNT} characters long to be published.`);
      return;
    }

    if (publishData.genre.length === 0) {
      setError('Please select at least one genre');
      return;
    }

    if (publishLimit.remaining <= 0) {
      setError(`You can only publish ${MAX_BOOKS_PER_DAY} books per 24 hours. Please try again later.`);
      return;
    }

    setIsPublishing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/books/${bookId}/publish`, {
        ...publishData,
        title: bookDetails.title,
        description: bookDetails.description,
        content: bookDetails.content,
        bookLength: bookLengthInfo.type
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish book');
      setIsPublishing(false);
    }
  };

  const getLengthBadgeClasses = () => {
    return bookLengthInfo.type === 'long' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800">Publish Your Book</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Publishing limits: You can publish up to {MAX_BOOKS_PER_DAY} books every 24 hours.
                  {publishLimit.remaining <= 0 ? (
                    <span className="font-bold"> You've reached your limit for today.</span>
                  ) : (
                    <span> You have {publishLimit.remaining} remaining for today.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl mb-2">{bookDetails.title}</h3>
                <p className="text-gray-600">{bookDetails.description}</p>
              </div>
              
              <div className={`flex items-center px-3 py-2 rounded-md border ${getLengthBadgeClasses()}`}>
                <Info className="w-4 h-4 mr-2" />
                <div>
                  <p className="font-medium">{bookLengthInfo.type === 'long' ? 'Long Book' : 'Short Book'}</p>
                  <p className="text-xs">
                    {bookLengthInfo.wordCount.toLocaleString()} words / {bookLengthInfo.charCount.toLocaleString()} chars
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
                <input
                  type="text"
                  name="subtitle"
                  value={publishData.subtitle}
                  onChange={handlePublishChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="A catchy subtitle for your book"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Synopsis (optional)</label>
                <textarea
                  name="synopsis"
                  value={publishData.synopsis}
                  onChange={handlePublishChange}
                  rows="5"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="A detailed description of your book to engage readers"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
                <p className="text-xs text-gray-500 mb-2">Select at least one genre that best describes your book</p>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        publishData.genre.includes(genre) 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {publishData.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={inputTag}
                  onChange={handleTagChange}
                  onKeyDown={handleTagKeyDown}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Type tag and press comma or enter"
                />
                <p className="text-xs text-gray-500 mt-1">Tags help readers discover your book</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    name="language"
                    value={publishData.language}
                    onChange={handlePublishChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Russian">Russian</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License</label>
                  <select
                    name="license"
                    value={publishData.license}
                    onChange={handlePublishChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="All rights reserved">All rights reserved</option>
                    <option value="Creative Commons">Creative Commons</option>
                    <option value="Public Domain">Public Domain</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="monetize"
                    name="isMonetized"
                    checked={publishData.isMonetized}
                    onChange={handlePublishChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="monetize" className="ml-2 block text-sm text-gray-700">
                    Enable monetization
                  </label>
                </div>
                
                {publishData.isMonetized && (
                  <div className="mt-3 pl-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                    <input
                      type="number"
                      name="price"
                      value={publishData.price}
                      onChange={handlePublishChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set a price between $0.99 and $99.99</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-md border ${getLengthBadgeClasses()}`}>
            <h4 className="font-medium flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Book Length Classification: <span className="ml-1 font-bold">{bookLengthInfo.type === 'long' ? 'Long Book' : 'Short Book'}</span>
            </h4>
            <p className="text-sm mt-1">
              Your book has {bookLengthInfo.wordCount.toLocaleString()} words and {bookLengthInfo.charCount.toLocaleString()} characters, 
              making it a {bookLengthInfo.type === 'long' ? 'long' : 'short'} book.
              {bookLengthInfo.type === 'long' 
                ? ' Long books are prioritized in discovery listings.' 
                : ' Short books are ideal for quick reads.'}
            </p>
            <p className="text-xs mt-2">
              <strong>Note:</strong> Books must be at least {MIN_CHARACTER_COUNT} characters to be published.
              Long books have over 40,000 words or 200,000 characters. Short books have fewer.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || publishData.genre.length === 0 || publishLimit.remaining <= 0 || bookLengthInfo.charCount < MIN_CHARACTER_COUNT}
            className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isPublishing || publishData.genre.length === 0 || publishLimit.remaining <= 0 || bookLengthInfo.charCount < MIN_CHARACTER_COUNT
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishBookModal;