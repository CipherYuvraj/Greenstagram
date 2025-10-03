import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';
import Settings from './pages/Settings';
import Debug from './pages/Debug';
import './App.css';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuthStore();
  return !token ? <>{children}</> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const { token, fetchProfile } = useAuthStore();

  useEffect(() => {
    // Fetch user profile on app load if token exists
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Debug Route - Only for development */}
          <Route path="/debug" element={<Debug />} />
          
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile Route */}
          <Route 
            path="/profile/:username" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Explore Route */}
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } 
          />
          
          {/* Create Post Route */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          
          {/* Settings Route */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          {/* Additional Routes for Future Features */}
          <Route 
            path="/challenges" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">🏆 Eco Challenges</h1>
                    <p className="text-gray-600">Coming soon! Join eco-friendly challenges and compete with the community.</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">🔔 Notifications</h1>
                    <p className="text-gray-600">Coming soon! Stay updated with your eco-community activities.</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">💬 Messages</h1>
                    <p className="text-gray-600">Coming soon! Connect with fellow eco-warriors through direct messages.</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* 404 page */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">🌿 404</h1>
                  <p className="text-gray-600 mb-4">This page seems to have gone green and disappeared!</p>
                  <Link 
                    to="/" 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;