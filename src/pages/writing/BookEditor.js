import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { debounce } from 'lodash';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  BookOpenIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import BookToolbar from '../../components/BookToolbar';
import PublishBookModal from '../../components/PublishBookModal';

const BookEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [showWritingTips, setShowWritingTips] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, error
  const [titleFocused, setTitleFocused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const limit = 100000; // Character limit

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Begin your story here...',
      }),
      CharacterCount.configure({
        limit,
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Highlight,
      Typography,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: book.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setBook(prev => ({ ...prev, content: html }));
      
      // Count words and characters
      const text = editor.getText();
      setCharacterCount(text.length);
      setWordCount(text.trim() ? text.split(/\s+/).length : 0);
      
      // Update save status
      setSaveStatus('unsaved');
    },
    autofocus: 'end',
  });

  // Save function with debounce
  const autoSave = useCallback(
    debounce(async (bookData) => {
      if (!bookData.title || !editor) return;
      
      setIsSaving(true);
      setSaveStatus('saving');
      try {
        const token = localStorage.getItem('token');
        if (id) {
          await axios.put(`http://localhost:5000/api/books/${id}`, {
            content: bookData.content,
            title: bookData.title,
            description: bookData.description
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } else {
          const response = await axios.post('http://localhost:5000/api/books', {
            title: bookData.title,
            description: bookData.description,
            content: bookData.content
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          navigate(`/writing/edit/${response.data.id}`);
        }
        setLastSaved(new Date());
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, 1500),
    [id, navigate, editor]
  );

  // Fetch book data or create new
  useEffect(() => {
    const fetchBook = async () => {
      if (id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/books/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setBook(response.data);
          if (editor && response.data.content) {
            editor.commands.setContent(response.data.content);
          }
          // Count words and characters for the loaded content
          if (response.data.content) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = response.data.content;
            const text = tempDiv.textContent || tempDiv.innerText;
            setCharacterCount(text.length);
            setWordCount(text.trim() ? text.split(/\s+/).length : 0);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch book');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, editor]);

  // Update editor content when book changes
  useEffect(() => {
    if (editor && book.content && !editor.isDestroyed) {
      // Only update if the content is different to avoid loops
      const currentContent = editor.getHTML();
      if (currentContent !== book.content) {
        editor.commands.setContent(book.content);
      }
    }
  }, [editor, book.content]);

  // Trigger autosave when book content changes
  useEffect(() => {
    if (!loading && book.title && editor) {
      autoSave(book);
    }
    return () => autoSave.cancel();
  }, [book, loading, autoSave, editor]);

  // Manual save function
  const handleManualSave = async () => {
    if (!book.title || !editor) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`http://localhost:5000/api/books/${id}`, {
          content: book.content,
          title: book.title,
          description: book.description
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        const response = await axios.post('http://localhost:5000/api/books', {
          title: book.title,
          description: book.description,
          content: book.content
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        navigate(`/writing/edit/${response.data.id}`);
      }
      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (err) {
      console.error('Manual save error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
    setSaveStatus('unsaved');
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    // Allow time for animation before focusing
    setTimeout(() => {
      if (editor) {
        editor.commands.focus();
      }
    }, 100);
  };

  // Writing tips
  const writingTips = [
    "Show, don't tell. Use sensory details to create vivid scenes.",
    "Create memorable characters with clear motivations and flaws.",
    "Vary your sentence structure to create rhythm in your prose.",
    "Use specific, concrete language rather than vague descriptions.",
    "Read your work aloud to catch awkward phrasing and improve flow.",
    "Consider the pacing of your story - balance action with reflection.",
    "Use dialogue to reveal character and advance the plot.",
    "Edit mercilessly. 'Kill your darlings' if they don't serve the story."
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800 font-medium">Loading your masterpiece...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-amber-50">
        <div className="text-center max-w-md p-6 bg-white rounded-sm shadow-md border-l-4 border-amber-600">
          <ExclamationCircleIcon className="h-12 w-12 text-amber-600 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-amber-900">Unable to load your book</h3>
          <p className="mt-2 text-amber-700">{error}</p>
          <button
            onClick={() => navigate('/writing')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-amber-600 hover:bg-amber-700"
          >
            Return to Writing Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 min-h-screen transition-all duration-300 ${fullscreen ? 'overflow-hidden' : ''}`}>
      {/* Top navigation bar */}
      <div className={`border-b border-amber-200 bg-white sticky top-0 z-10 shadow-sm transition-all duration-300 ${fullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <div className="flex-1 flex items-center">
            <button
              onClick={() => navigate('/writing')}
              className="p-2 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="ml-4 flex items-center">
              {saveStatus === 'saving' && (
                <div className="flex items-center text-amber-600">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              
              {saveStatus === 'saved' && (
                <div className="flex items-center text-green-600">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Saved at {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Failed to save</span>
                  <button 
                    onClick={handleManualSave}
                    className="ml-2 text-amber-600 hover:text-amber-800 text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              )}
              
              {saveStatus === 'unsaved' && (
                <div className="flex items-center text-amber-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-amber-700 text-sm">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              <span>{wordCount} words</span>
            </div>
            
            <button
              onClick={() => setShowWritingTips(!showWritingTips)}
              className="p-2 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors"
              aria-label="Show Writing Tips"
            >
              <SparklesIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors"
              aria-label="Toggle Fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            
            <button
              onClick={() => {
                if (characterCount < 5000) {
                  alert('Your book must be at least 5,000 characters long to be published.');
                  return;
                }
                setShowPublishModal(true);
              }}
              disabled={!book.title || !book.description || !editor?.getText().trim() || characterCount < 5000}
              className={`ml-3 px-4 py-2 rounded-sm text-white ${
                !book.title || !book.description || !editor?.getText().trim() || characterCount < 5000
                  ? 'bg-amber-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700'
              } transition-colors shadow-sm`}
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Writing Tips Slide-out Panel */}
      <AnimatePresence>
        {showWritingTips && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-amber-800 text-amber-50 shadow-lg z-20 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold">Writing Tips</h3>
                <button 
                  onClick={() => setShowWritingTips(false)}
                  className="p-1 rounded-full text-amber-200 hover:text-amber-50 hover:bg-amber-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {writingTips.map((tip, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-amber-700 rounded-sm"
                  >
                    <p className="text-amber-100">{tip}</p>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-amber-700">
                  <p className="text-amber-200 text-sm italic">
                    "Write with the door closed, rewrite with the door open." - Stephen King
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main editor area */}
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`transition-all duration-300 ${
          fullscreen 
            ? 'fixed inset-0 bg-amber-50 z-50 overflow-y-auto py-4 px-4' 
            : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
        }`}
      >
        {/* Title and description */}
        <div className={`mb-8 ${fullscreen ? 'max-w-3xl mx-auto' : ''}`}>
          <div className={`relative ${titleFocused ? 'border-b-2 border-amber-400' : 'border-b border-amber-200'} transition-colors`}>
            <input
              type="text"
              name="title"
              value={book.title}
              onChange={handleChange}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              placeholder="Book Title"
              className="w-full text-4xl font-serif font-bold border-none focus:ring-0 p-0 mb-2 focus:outline-none bg-transparent text-amber-900"
            />
          </div>
          <textarea
            name="description"
            value={book.description}
            onChange={handleChange}
            placeholder="Short description of your book"
            className="w-full text-amber-700 border-none focus:ring-0 p-0 resize-none focus:outline-none text-xl mt-4 bg-transparent"
            rows="2"
          />
        </div>

        {/* Editor toolbar */}
        {editor && (
          <div className={`${fullscreen ? 'max-w-3xl mx-auto' : ''}`}>
            <BookToolbar editor={editor} />
          </div>
        )}

        {/* Text editor */}
        <div className={`prose prose-amber prose-lg max-w-none mt-6 ${fullscreen ? 'max-w-3xl mx-auto' : ''}`}>
          <EditorContent 
            editor={editor} 
            className={`min-h-[600px] outline-none bg-white p-6 rounded-sm shadow-md border border-amber-100 ${
              fullscreen ? 'min-h-[calc(100vh-200px)]' : ''
            }`} 
          />
          
          {/* Word count */}
          <div className="mt-4 text-sm text-amber-600 flex justify-between items-center">
            <div>
              <span className="font-medium">{wordCount}</span> words | <span className="font-medium">{characterCount}</span> characters
              {limit && (
                <span> | {Math.max(0, limit - characterCount)} characters remaining</span>
              )}
            </div>
            
            {fullscreen && (
              <button
                onClick={toggleFullscreen}
                className="text-amber-700 hover:text-amber-900 transition-colors"
              >
                Exit Fullscreen
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen exit button (fixed position) */}
      {fullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 p-2 bg-amber-800 text-amber-50 rounded-full shadow-lg hover:bg-amber-700 transition-colors z-50"
          aria-label="Exit Fullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Publish modal */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PublishBookModal
              bookId={id}
              bookDetails={book}
              onClose={() => setShowPublishModal(false)}
              onSuccess={() => navigate('/writing')}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress indicator (bottom fixed) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 p-2 flex justify-center text-xs text-amber-700">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <ClockIcon className="h-3 w-3 mr-1" />
            <span>Reading time: ~{Math.ceil(wordCount / 200)} min</span>
          </div>
          
          <div className="flex items-center">
            <BookOpenIcon className="h-3 w-3 mr-1" />
            <span>
              {wordCount < 10000 ? 'Short story' : 
              wordCount < 40000 ? 'Novella' : 'Novel'}
            </span>
          </div>
          
          <div className="flex items-center">
            <PencilSquareIcon className="h-3 w-3 mr-1" />
            <span>
              {wordCount < 500 ? 'Just getting started' :
              wordCount < 5000 ? 'Making progress' :
              wordCount < 20000 ? 'Well underway' :
              'Substantial work'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookEditor;