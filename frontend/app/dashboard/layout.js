'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const { bgTheme, setBgTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bgThemes = [
    { id: 'classic', name: 'Classic (No Theme)', previewColor: null },
    { id: 'sentinel', name: 'Sentinel Default', previewColor: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { id: 'cyber', name: 'Cyber Neon', previewColor: 'linear-gradient(135deg, #a855f7, #22c55e)' },
    { id: 'aurora', name: 'Aurora Glow', previewColor: 'linear-gradient(135deg, #14b8a6, #3b82f6)' },
    { id: 'sunset', name: 'Sunset Eclipse', previewColor: 'linear-gradient(135deg, #f43f5e, #f59e0b)' },
    { id: 'obsidian', name: 'Midnight Obsidian', previewColor: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center transition-colors duration-500">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin"></div>
          <span className="text-subtitle text-sm mt-4 tracking-wider font-sans">Loading Session...</span>
        </div>
      </div>
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

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: 'Projects',
      path: '/dashboard/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      name: 'Bugs',
      path: '/dashboard/bugs',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    ...(user && user.role === 'Administrator' ? [{
      name: 'All Users',
      path: '/dashboard/users',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 01-12 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }] : [])
  ];

  return (
    <div className="h-screen overflow-hidden flex text-page-fg font-sans transition-colors duration-500">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-card-bg border-r border-card-border shrink-0 transition-colors duration-500 overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-card-border">
          <span className="text-xl font-bold text-title font-f1">
            BugSentinel
          </span>
          <ThemeToggle className="p-2 rounded-xl bg-card-bg border border-card-border text-page-fg shadow hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur flex items-center justify-center shrink-0" />
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'text-subtitle hover:text-title hover:bg-input-bg'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Background Theme Selector */}
        <div className="px-6 py-4 border-t border-card-border/60">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
            Background Theme
          </span>
          <div className="flex gap-2.5 flex-wrap">
            {bgThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => setBgTheme(t.id)}
                title={t.name}
                className={`w-7 h-7 rounded-full border transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center relative overflow-hidden ${
                  bgTheme === t.id
                    ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500/20'
                    : 'border-card-border hover:border-slate-400'
                }`}
                style={t.previewColor ? { background: t.previewColor } : { background: 'linear-gradient(135deg, #1e293b 50%, #0f172a 50%)' }}
              >
                {t.id === 'classic' ? (
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  bgTheme === t.id && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full shadow" />
                  )
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-card-border bg-input-bg/40">
          <div className="flex flex-col mb-4">
            <span className="font-semibold text-title text-sm truncate">{user.name}</span>
            <span className="text-subtitle text-xs truncate mb-2">{user.email}</span>
            <div className="self-start">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-card-bg hover:bg-input-bg hover:text-rose-500 px-4 py-2.5 rounded-xl text-sm font-medium text-title transition-colors border border-card-border hover:border-slate-400 cursor-pointer font-sans"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Mobile Layout Wrapper */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Mobile Navbar Header */}
        <header className="md:hidden h-16 bg-card-bg border-b border-card-border flex items-center justify-between px-6 z-20 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-title font-f1">
              BugSentinel
            </span>
            <ThemeToggle className="p-1.5 rounded-lg bg-card-bg border border-card-border text-page-fg shadow hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur flex items-center justify-center shrink-0" />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-subtitle hover:text-title hover:bg-input-bg rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-page-bg/95 backdrop-blur z-10 flex flex-col justify-between p-6">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-subtitle hover:bg-input-bg/60'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-card-border pt-6">
              {/* Mobile Themes Swatches */}
              <div className="mb-6 pb-6 border-b border-card-border/60">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">
                  Background Theme
                </span>
                <div className="flex gap-3 flex-wrap">
                  {bgThemes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setBgTheme(t.id)}
                      title={t.name}
                      className={`w-8 h-8 rounded-full border transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center relative overflow-hidden ${
                        bgTheme === t.id
                          ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500/20'
                          : 'border-card-border'
                      }`}
                      style={t.previewColor ? { background: t.previewColor } : { background: 'linear-gradient(135deg, #1e293b 50%, #0f172a 50%)' }}
                    >
                      {t.id === 'classic' ? (
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        bgTheme === t.id && (
                          <span className="w-1.5 h-1.5 bg-white rounded-full shadow" />
                        )
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col mb-4">
                <span className="font-semibold text-title text-base">{user.name}</span>
                <span className="text-subtitle text-sm">{user.email}</span>
                <div className="self-start mt-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-card-bg hover:bg-input-bg hover:text-rose-500 px-4 py-3 rounded-xl text-base font-medium text-title transition-colors border border-card-border cursor-pointer font-sans"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl w-full mx-auto relative transition-colors duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
