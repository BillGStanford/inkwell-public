// src/components/AuthDebugger.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebugger = () => {
  const { user } = useAuth();
  const [tokenInfo, setTokenInfo] = useState({
    exists: false,
    payload: null,
    expiry: null,
    isExpired: false
  });
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Parse JWT token if possible
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const expiry = payload.exp ? new Date(payload.exp * 1000) : null;
          const isExpired = expiry ? new Date() > expiry : false;
          
          setTokenInfo({
            exists: true,
            payload,
            expiry: expiry ? expiry.toLocaleString() : 'No expiry',
            isExpired
          });
        } else {
          setTokenInfo({
            exists: true,
            payload: 'Not a valid JWT format',
            expiry: 'Unknown',
            isExpired: false
          });
        }
      } catch (e) {
        setTokenInfo({
          exists: true,
          payload: 'Error parsing token',
          expiry: 'Unknown',
          isExpired: false
        });
      }
    } else {
      setTokenInfo({
        exists: false,
        payload: null,
        expiry: null,
        isExpired: false
      });
    }
  }, [user]);

  const testAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setTestResult({
          success: false,
          status: response.status,
          message: errorData.message || response.statusText
        });
      } else {
        const data = await response.json();
        setTestResult({
          success: true,
          status: response.status,
          bookmarksCount: data.length
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message
      });
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Authentication Debug Info</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">User State</h3>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
          {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
        </pre>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">Token Info</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Token in localStorage:</span> 
            <span className={tokenInfo.exists ? 'text-green-600' : 'text-red-600'}>
              {tokenInfo.exists ? 'Yes' : 'No'}
            </span>
          </div>
          
          {tokenInfo.exists && (
            <>
              <div>
                <span className="font-medium">Expiry:</span> {tokenInfo.expiry}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={tokenInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
                  {tokenInfo.isExpired ? 'Expired' : 'Valid'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {testResult && (
        <div className={`mb-6 p-4 rounded ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="font-medium mb-2">Test Result</h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Status:</span> 
              <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                {testResult.success ? 'Success' : 'Failed'}
              </span>
            </div>
            {testResult.status && (
              <div>
                <span className="font-medium">Response Code:</span> {testResult.status}
              </div>
            )}
            {testResult.message && (
              <div>
                <span className="font-medium">Message:</span> {testResult.message}
              </div>
            )}
            {testResult.bookmarksCount !== undefined && (
              <div>
                <span className="font-medium">Bookmarks:</span> {testResult.bookmarksCount}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={testAuth}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test API Access
        </button>
        <button
          onClick={clearToken}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Token
        </button>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Add this component to any page to debug authentication issues. If you're seeing 401 errors, check:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Is the token in localStorage?</li>
          <li>Has the token expired?</li>
          <li>Is the token being sent correctly in the Authorization header?</li>
          <li>Is the backend correctly validating the token?</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDebugger;