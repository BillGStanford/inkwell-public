import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Edit, Trash2, RefreshCw, AlertCircle, Plus, Archive } from 'lucide-react';

// API service for book operations
const bookService = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  async getActiveBooks(token) {
    return axios.get(`${this.baseUrl}/books/my-books`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  async getAllBooks(token) {
    return axios.get(`${this.baseUrl}/books/my-books`, {
      params: { includeDeleted: 'true' },
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  async deleteBook(bookId, token) {
    return axios.delete(`${this.baseUrl}/books/${bookId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  async restoreBook(bookId, token) {
    return axios.post(`${this.baseUrl}/books/${bookId}/restore`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// Book card component
const BookCard = ({ book, onDelete, onRestore, isDeleted = false, isRestoring = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={`group relative border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
        isDeleted ? 'border-amber-200 bg-red-50' : 'bg-white'
      }`}
    >
      <div className="absolute -inset-1 bg-amber-200 rounded-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      <div className="relative p-5">
        <h2 className="text-xl font-serif font-semibold mb-2 text-amber-900 line-clamp-1 group-hover:text-amber-700 transition-colors">{book.title}</h2>
        <p className="text-amber-800 mb-4 line-clamp-3 h-18">{book.description || "No description provided."}</p>
        
        {isDeleted ? (
          <div className="mb-4 bg-red-100 p-3 rounded-md">
            <div className="text-sm text-red-700 flex items-center gap-1">
              <AlertCircle size={16} />
              <span>Deleted on: {formatDate(book.deletedAt)}</span>
            </div>
            <div className="text-sm text-red-700 mt-1">
              Will be permanently deleted on: {formatDate(book.scheduledForDeletionAt)}
            </div>
          </div>
        ) : (
          <div className="flex items-center mb-4">
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
              book.isPublished 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {book.isPublished ? 'Published' : 'Draft'}
            </span>
            {book.lastModified && (
              <span className="text-xs text-amber-600 ml-2">
                Updated {new Date(book.lastModified).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-end items-center gap-2 mt-6 pt-4 border-t border-amber-100">
          {isDeleted ? (
            <button
              onClick={() => onRestore(book.id)}
              disabled={isRestoring}
              className={`px-4 py-2 flex items-center gap-2 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-colors shadow-sm ${
                isRestoring ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isRestoring ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Restore</span>
                </>
              )}
            </button>
          ) : (
            <>
              <Link
                to={`/writing/edit/${book.id}`}
                className="px-3 py-2 flex items-center gap-1 text-amber-600 hover:bg-amber-50 rounded-sm transition-colors"
              >
                {book.isPublished ? (
                  <>
                    <BookOpen size={16} />
                    <span>View</span>
                  </>
                ) : (
                  <>
                    <Edit size={16} />
                    <span>Edit</span>
                  </>
                )}
              </Link>
              <button
                onClick={() => onDelete(book.id, book.title)}
                className="px-3 py-2 flex items-center gap-1 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Empty state component
const EmptyState = ({ type, onCreate }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="text-center py-16 border-2 border-dashed border-amber-200 rounded-sm bg-amber-50"
  >
    <div className="flex justify-center mb-4">
      {type === 'active' ? (
        <BookOpen size={48} className="text-amber-400" />
      ) : (
        <Archive size={48} className="text-amber-400" />
      )}
    </div>
    <h3 className="text-lg font-medium text-amber-900 mb-2">
      {type === 'active' ? "You haven't created any books yet" : "No deleted books"}
    </h3>
    <p className="text-amber-700 mb-6 max-w-md mx-auto">
      {type === 'active' 
        ? "Start your writing journey by creating your first book" 
        : "Books you delete will appear here for 10 days before being permanently removed"}
    </p>
    {type === 'active' && (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreate}
        className="px-4 py-2 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-colors shadow-md flex items-center gap-2 mx-auto"
      >
        <Plus size={16} />
        <span>Create Your First Book</span>
      </motion.button>
    )}
  </motion.div>
);

// Confirmation modal component
const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-sm shadow-xl p-6 max-w-md w-full mx-4 border border-amber-200"
      >
        <h3 className="text-lg font-medium text-amber-900 mb-2">{title}</h3>
        <p className="text-amber-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-sm hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main component
const MyBooks = () => {
  const { user } = useAuth();
  const [activeBooks, setActiveBooks] = useState([]);
  const [deletedBooks, setDeletedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [restoringBookId, setRestoringBookId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, bookId: null, bookTitle: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch books from API
  const fetchBooks = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [activeResponse, allResponse] = await Promise.all([
        bookService.getActiveBooks(token),
        bookService.getAllBooks(token)
      ]);
      
      setActiveBooks(activeResponse.data);
      setDeletedBooks(allResponse.data.filter(book => book.isDeleted));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError(err.response?.data?.message || 'Failed to fetch your books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, refreshTrigger]);

  // Delete book handler
  const handleDeleteBook = async (bookId, bookTitle) => {
    setDeleteModal({ show: true, bookId, bookTitle });
  };

  // Confirm delete action
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await bookService.deleteBook(deleteModal.bookId, token);
      setDeleteModal({ show: false, bookId: null, bookTitle: '' });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to delete book:', err);
      setError(err.response?.data?.message || 'Failed to delete the book. Please try again.');
    }
  };

  // Restore book handler
  const handleRestoreBook = async (bookId) => {
    try {
      setRestoringBookId(bookId);
      const token = localStorage.getItem('token');
      await bookService.restoreBook(bookId, token);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to restore book:', err);
      setError(err.response?.data?.message || 'Failed to restore the book. Please try again.');
    } finally {
      setRestoringBookId(null);
    }
  };

  // Handle tab change
  const toggleView = (showDeletedView) => {
    setShowDeleted(showDeletedView);
    setError(null); // Clear any errors when switching views
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header section */}
      <div className="bg-gradient-to-b from-amber-900 to-amber-800 text-amber-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold">My Books</h1>
            <p className="mt-2 text-amber-200">Manage your literary creations</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex border rounded-sm overflow-hidden shadow-sm">
            <button
              onClick={() => toggleView(false)}
              className={`px-4 py-2 flex-1 text-sm font-medium ${
                !showDeleted 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-white text-amber-700 hover:bg-amber-50'
              }`}
            >
              Active Books
            </button>
            <button
              onClick={() => toggleView(true)}
              className={`px-4 py-2 flex-1 text-sm font-medium ${
                showDeleted 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-white text-amber-700 hover:bg-amber-50'
              }`}
            >
              Deleted Books
            </button>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/writing/new"
              className="px-4 py-2 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>Create New Book</span>
            </Link>
          </motion.div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6 flex items-center"
            >
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content section */}
        <div className="mb-6">
          {showDeleted ? (
            // Show deleted books section
            <>
              <div className="mb-6">
                <h2 className="text-xl font-serif font-semibold text-amber-900 mb-2">Deleted Books</h2>
                <p className="text-amber-700">
                  These books will be permanently deleted after 10 days. You can restore them before that time.
                </p>
              </div>
              
              {deletedBooks.length === 0 ? (
                <EmptyState type="deleted" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deletedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onRestore={handleRestoreBook}
                      isDeleted={true}
                      isRestoring={restoringBookId === book.id}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Show active books section
            activeBooks.length === 0 ? (
              <EmptyState 
                type="active" 
                onCreate={() => window.location.href = '/writing/new'} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onDelete={handleDeleteBook}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Final CTA if no books */}
      {activeBooks.length === 0 && !showDeleted && (
        <div className="bg-amber-800 text-amber-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Ready to Begin Your Literary Adventure?
              </h2>
              <p className="mt-4 text-lg max-w-3xl mx-auto text-amber-100">
                Start creating your first book and share your stories with the world.
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <ConfirmationModal
            show={deleteModal.show}
            title="Delete Book"
            message={`Are you sure you want to delete "${deleteModal.bookTitle}"? The book will be moved to your deleted items and automatically removed after 10 days.`}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteModal({ show: false, bookId: null, bookTitle: '' })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBooks;