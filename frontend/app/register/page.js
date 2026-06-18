'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!name || !email || !password || !role) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    const res = await register(name, email, password, role);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-page-bg bg-dot-pattern relative overflow-hidden px-4 py-8">
      {/* Theme Toggle Button */}
      <ThemeToggle />

      {/* Slow floating subtle blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none animate-float-reverse"></div>

      <div className="w-full max-w-lg relative z-10">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="hover:text-page-fg transition-colors ml-2 font-bold">×</button>
          </div>
        )}

        <div className="backdrop-blur-xl bg-card-bg border border-card-border rounded-3xl p-8 md:p-10 shadow-2xl transition-colors duration-500">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-title font-f1">
              Create Account
            </h1>
            <p className="text-subtitle mt-2 text-sm font-sans">
              Create your profile and select your project role
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2 font-sans" htmlFor="name">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-500 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-input-bg border border-input-border rounded-xl pl-11 pr-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                />
              </div>
            </div>

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
                  placeholder="jane.doe@example.com"
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

            <div>
              <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-3 font-sans">
                Your Project Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Administrator', label: 'Admin', desc: 'Manage Team' },
                  { id: 'Developer', label: 'Developer', desc: 'Fix Defects' },
                  { id: 'Tester', label: 'Tester', desc: 'File Issues' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      role === item.id
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                        : 'border-card-border bg-input-bg hover:border-slate-400'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${role === item.id ? 'text-indigo-600 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-300'} font-sans`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-snug font-sans">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-medium py-3 px-4 rounded-xl cursor-pointer font-sans bg-indigo-600 hover:bg-indigo-700 transition-all duration-400 shadow-lg ease-in-out shadow-indigo-500/20 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-card-border pt-6">
            <p className="text-subtitle text-sm font-sans">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
