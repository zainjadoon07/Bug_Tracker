'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-page-bg bg-dot-pattern relative overflow-hidden px-4">
      {/* Theme Toggle Button */}
      <ThemeToggle />

      {/* Slow floating subtle blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none animate-float-reverse"></div>

      <div className="w-full max-w-md relative z-10">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="hover:text-page-fg transition-colors ml-2 font-bold">×</button>
          </div>
        )}

        <div className="backdrop-blur-xl bg-card-bg border border-card-border rounded-3xl p-8 md:p-10 shadow-2xl transition-colors duration-500">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-title font-f1">
              BugSentinel
            </h1>
            <p className="text-subtitle mt-2 text-sm font-sans">
              Cloud-Based Bug Tracking System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2 font-sans" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-500 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@bugsentinel.com"
                  className="w-full bg-input-bg border border-input-border rounded-xl pl-11 pr-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2 font-sans" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-500 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-input-bg border border-input-border rounded-xl pl-11 pr-11 py-3 text-page-fg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 013.918-4.72M8.28 8.28L20 20M9.878 9.878a3 3 0 104.242 4.242M9.88 9.88l4.24 4.24M10.733 5.077A9.865 9.865 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 4.717m-1.748-1.748L20 20" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-medium py-3 px-4 rounded-xl cursor-pointer font-sans bg-indigo-600 hover:bg-indigo-700 transition-all duration-400 shadow-lg ease-in-out shadow-indigo-500/20 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-card-border pt-6">
            <p className="text-subtitle text-sm font-sans">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
