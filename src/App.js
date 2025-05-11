// client/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import MyBooks from './pages/writing/MyBooks';
import BookEditor from './pages/writing/BookEditor';
import Discovery from './pages/Discovery';
import BookReader from './pages/BookReader';
import Library from './pages/Library';
import AuthDebugger from './components/AuthDebugger';

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user/:username" element={<UserProfile />} />
            <Route path="/discover" element={<Discovery />} />
            <Route path="/book/:id" element={<BookReader />} />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/writing" 
              element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/writing/new" 
              element={
                <ProtectedRoute>
                  <BookEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/writing/edit/:id" 
              element={
                <ProtectedRoute>
                  <BookEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
  path="/library" 
  element={
    <ProtectedRoute>
      <Library />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/debug" 
  element={
    <ProtectedRoute>
      <AuthDebugger />
    </ProtectedRoute>
  } 
/>
          </Routes>
        </main>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;