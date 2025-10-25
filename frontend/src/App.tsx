import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Explore = lazy(() => import('./pages/Explore'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const Settings = lazy(() => import('./pages/Settings'));
const Debug = lazy(() => import('./pages/Debug'));
const PlantHealth = lazy(() => import('./pages/PlantHealth'));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

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
  const { token, fetchProfile, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    // Fetch user profile on app load if token exists
    if (token) {
      fetchProfile().catch(console.error);
    }
  }, [token, fetchProfile]);

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
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
          
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <ErrorBoundary>
                    <Login />
                  </ErrorBoundary>
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <ErrorBoundary>
                    <Register />
                  </ErrorBoundary>
                </PublicRoute>
              } />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Home />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/explore" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Explore />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <CreatePost />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Settings />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/debug" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Debug />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/profile/:username" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* Plant Health Detector Route */}
              <Route path="/plant-health" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <PlantHealth />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* Additional Feature Routes with Placeholders */}
              <Route path="/challenges" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">🏆 Eco Challenges</h1>
                        <p className="text-gray-600">Coming soon! Join eco-friendly challenges and compete with the community.</p>
                      </div>
                    </div>
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">🔔 Notifications</h1>
                        <p className="text-gray-600">Coming soon! Stay updated with your eco-community activities.</p>
                      </div>
                    </div>
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">💬 Messages</h1>
                        <p className="text-gray-600">Coming soon! Connect with fellow eco-warriors through direct messages.</p>
                      </div>
                    </div>
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
                    <Link 
                      to="/" 
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Go Home
                    </Link>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;