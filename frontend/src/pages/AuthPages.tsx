import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';

interface AuthPageProps {
  isSignup: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ isSignup }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Input Validations
    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        // Sign Up
        await axios.post(`${API_BASE_URL}/auth/signup`, { email, password });
        
        // Auto Login on success
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        await login(loginResponse.data.access_token);
      } else {
        // Sign In
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        await login(loginResponse.data.access_token);
      }
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Authentication failed. Please verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden bg-darkBg text-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accentPurple/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-2xl border border-slate-200 relative shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {isSignup ? "Create account" : "Welcome back"}
          </h2>
          <p className="text-sm text-slate-600">
            {isSignup 
              ? "Join CodeExplain and start understanding scripts in plain English" 
              : "Access your dashboard workspace history and bookmarks"}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@codeexplain.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-accentPurple focus:ring-1 focus:ring-accentPurple outline-none transition-all text-sm text-slate-900 shadow-sm"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-accentPurple focus:ring-1 focus:ring-accentPurple outline-none transition-all text-sm text-slate-900 shadow-sm"
              />
            </div>
          </div>

          {/* Confirm Password input field for signup */}
          {isSignup && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-accentPurple focus:ring-1 focus:ring-accentPurple outline-none transition-all text-sm text-slate-900 shadow-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white glass-btn transition-all text-sm flex items-center justify-center gap-2 mt-4 shadow-sm"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                {isSignup ? "Sign Up" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-600">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-accentPurple hover:text-slate-900 font-semibold underline transition-colors">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to CodeExplain?{" "}
              <Link to="/signup" className="text-accentPurple hover:text-slate-900 font-semibold underline transition-colors">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
