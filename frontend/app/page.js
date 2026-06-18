'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './components/ThemeToggle';

export default function HomePage() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-page-bg flex items-center justify-center transition-colors duration-500">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin"></div>
          <span className="text-subtitle text-sm mt-4 tracking-wider">Verifying Session...</span>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case 'Developer': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'Tester': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <main className="min-h-screen bg-page-bg bg-dot-pattern relative overflow-hidden flex items-center justify-center p-6 transition-colors duration-500">
      {/* Theme Toggle Button */}
      <ThemeToggle />

      {/* Slow floating subtle blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none animate-float-reverse"></div>

      <div className="w-full max-w-2xl text-center relative z-10 space-y-6">
        {/* Banner Card */}
        <div className="backdrop-blur-xl bg-card-bg border border-card-border rounded-3xl p-8 md:p-12 shadow-2xl space-y-6 transition-colors duration-500">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-400 font-f1">
            Session Verified
          </h1>
          
          <p className="text-subtitle text-sm max-w-md mx-auto leading-relaxed">
            Congratulations! The auth flow is fully configured and connected to your local MySQL database.
          </p>

          <div className="bg-input-bg border border-card-border rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 transition-colors duration-500">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Session Profile
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-subtitle">Name:</span>
              <span className="font-semibold text-title">{user.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-subtitle">Email:</span>
              <span className="font-semibold text-title">{user.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-subtitle">Assigned Role:</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={logout}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Sign Out / Logout
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-xs font-sans">
          Please tell me in the chat once you verify registration, login, and logout. Then we will proceed to building projects and bugs views!
        </p>
      </div>
    </main>
  );
}
