import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Route wrapper preventing unauthorized entry
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darkBg text-slate-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentPurple"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Navigation header
export const Navbar: React.FC = () => {
  const { token, logout, user } = useAuth();
  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-borderDark/60">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold bg-gradient-to-r from-accentPurpleLight to-accentPurple bg-clip-text text-transparent">
          ⚡ CodeExplain
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors">Home</Link>
        {token ? (
          <>
            <Link to="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors">Dashboard</Link>
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-accentPurpleLight">{user?.email}</span>
            <button 
              onClick={logout} 
              className="px-4 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 border border-slate-700/50 transition-all"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-400 hover:text-slate-200 transition-colors">Login</Link>
            <Link 
              to="/signup" 
              className="px-4 py-1.5 rounded-lg text-white glass-btn transition-all font-semibold"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-darkBg text-slate-200">
          <Routes>
            {/* Landing page, Login, Signup page layouts inside Browser Router */}
            <Route path="/" element={<LandingPageWrapper />} />
            <Route path="/login" element={<LoginPageWrapper />} />
            <Route path="/signup" element={<SignupPageWrapper />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardWrapper />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Lazy components wrappers for single-file entry compilation loading
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPages';
import Dashboard from './pages/Dashboard';

const LandingPageWrapper = () => (
  <>
    <Navbar />
    <LandingPage />
  </>
);

const LoginPageWrapper = () => (
  <>
    <Navbar />
    <AuthPage isSignup={false} />
  </>
);

const SignupPageWrapper = () => (
  <>
    <Navbar />
    <AuthPage isSignup={true} />
  </>
);

const DashboardWrapper = () => (
  <Dashboard />
);

export default App;
