import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { loginUser } from '../services/api';
import { Mail, Lock, ArrowRight, AlertCircle, Package } from 'lucide-react';

export default function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await loginUser({ email, password });
      
      if (res.data && res.data.success) {
        login(res.data.data);
        navigate('/');
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Could not connect to the authentication server. Please check your credentials or backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl relative z-10">
        
        {/* Header/Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mb-4">
            <Package className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to borrow and share items across campus
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start space-x-3 text-rose-800 text-xs font-semibold animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-150 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
              Register now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
