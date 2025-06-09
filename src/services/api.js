// src/services/api.js
import axios from 'axios';

const API_URL = 'https://tender-emu-2.loca.lt/';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - token may be invalid or expired');
      // You could handle automatic logout here if needed
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Bookmark services
export const bookmarkService = {
  getAll: () => api.get('/bookmarks'),
  create: (bookData) => api.post('/bookmarks', bookData),
  remove: (id) => api.delete(`/bookmarks/${id}`),
};

// Book services
export const bookService = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  getPages: (id) => api.get(`/books/${id}/pages`),
};

// User services
export const userService = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

export default api;
