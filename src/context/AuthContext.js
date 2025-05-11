// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios interceptor to add the token to all requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Load user from token on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const { data } = await axios.get('http://localhost:5000/api/auth/me', config);
      
      // Store the token in the user object for components that need it directly
      setUser({
        ...data,
        token: token
      });
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('token');
      setError('Authentication failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      setLoading(true);
      setError(null);
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      
      // Make sure user object has the token property
      setUser({
        ...data,
        token: data.token
      });
      
      return data;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, email, password, bio = '') => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        bio
      });
      
      localStorage.setItem('token', data.token);
      
      // Make sure user object has the token property
      setUser({
        ...data,
        token: data.token
      });
      
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};