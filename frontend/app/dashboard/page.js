'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getDashboardStats();
      setStats(data);

      if (user?.role === 'Administrator') {
        const usersData = await api.getUsers();
        setUsers(usersData);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const isAdmin = user?.role === 'Administrator';

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-input-bg rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-card-bg border border-card-border rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-card-bg border border-card-border rounded-2xl"></div>
          <div className="h-80 bg-card-bg border border-card-border rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card-bg border border-card-border rounded-2xl text-center transition-colors duration-500">
        <div className="p-3 bg-rose-500/10 rounded-full text-rose-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-title">Connection Failed</h3>
        <p className="text-subtitle text-sm mt-1 max-w-xs">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      color: 'text-indigo-500 dark:text-indigo-400 border-indigo-500/20',
      icon: (
        <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      title: 'Total Defects',
      value: stats.totalBugs,
      color: 'text-violet-500 dark:text-violet-400 border-violet-500/20',
      icon: (
        <svg className="w-5 h-5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      title: 'Open Issues',
      value: stats.openBugs,
      color: 'text-amber-500 dark:text-amber-400 border-amber-500/20',
      icon: (
        <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Resolved Fixes',
      value: stats.resolvedBugs,
      color: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
      icon: (
        <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Critical Status',
      value: stats.criticalBugs,
      color: 'text-rose-500 dark:text-rose-400 border-rose-500/20',
      icon: (
        <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-title flex items-center gap-2">
          <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          Dashboard Overview
        </h1>
        <p className="text-subtitle text-sm mt-1">
          Here is the current operational health of your bug tracking ecosystem.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {kpis.map((card) => (
          <div
            key={card.title}
            className="bg-card-bg border border-card-border rounded-2xl p-6 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md duration-500 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-subtitle text-xs font-semibold uppercase tracking-wider">
                {card.title}
              </span>
              {card.icon}
            </div>
            <span className={`block text-4xl font-bold mt-4 ${card.color.split(' ')[0]}`}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Admin User Counts Breakdown (Gated widget) */}
      {isAdmin && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 transition-colors duration-500 animate-fadeIn">
          <h2 className="text-lg font-semibold text-title mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Registered Users & Scope Counts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-input-bg border border-card-border rounded-xl p-4 flex flex-col justify-between transition-colors duration-500">
              <span className="text-subtitle text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Administrators
              </span>
              <span className="text-2xl font-bold text-violet-400 mt-2 font-mono">
                {users.filter(u => u.role === 'Administrator').length}
              </span>
            </div>
            <div className="bg-input-bg border border-card-border rounded-xl p-4 flex flex-col justify-between transition-colors duration-500">
              <span className="text-subtitle text-xs font-semibold uppercase tracking-wider font-sans flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Developers
              </span>
              <span className="text-2xl font-bold text-sky-400 mt-2 font-mono">
                {users.filter(u => u.role === 'Developer').length}
              </span>
            </div>
            <div className="bg-input-bg border border-card-border rounded-xl p-4 flex flex-col justify-between transition-colors duration-500">
              <span className="text-subtitle text-xs font-semibold uppercase tracking-wider font-sans flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Testers
              </span>
              <span className="text-2xl font-bold text-amber-400 mt-2 font-mono">
                {users.filter(u => u.role === 'Tester').length}
              </span>
            </div>
            <div className="bg-input-bg border border-card-border rounded-xl p-4 flex flex-col justify-between transition-colors duration-500">
              <span className="text-subtitle text-xs font-semibold uppercase tracking-wider font-sans flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Total Headcount
              </span>
              <span className="text-2xl font-bold text-white mt-2 font-mono">
                {users.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Tracker Card */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 transition-colors duration-500">
          <h2 className="text-lg font-semibold text-title mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Defect Status Breakdown
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Open', count: stats.bugsByStatus.Open, color: 'bg-slate-500' },
              { label: 'Assigned', count: stats.bugsByStatus.Assigned, color: 'bg-indigo-500' },
              { label: 'In Progress', count: stats.bugsByStatus.InProgress, color: 'bg-sky-500' },
              { label: 'Testing', count: stats.bugsByStatus.Testing, color: 'bg-amber-500' },
              { label: 'Resolved', count: stats.bugsByStatus.Resolved, color: 'bg-emerald-500' },
              { label: 'Closed', count: stats.bugsByStatus.Closed, color: 'bg-teal-700' }
            ].map((status) => {
              const percentage = stats.totalBugs > 0 ? (status.count / stats.totalBugs) * 100 : 0;
              return (
                <div key={status.label}>
                  <div className="flex justify-between text-xs font-medium text-subtitle mb-1">
                    <span>{status.label}</span>
                    <span>{status.count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-input-bg border border-card-border rounded-full h-2 transition-colors duration-500">
                    <div
                      className={`h-2 rounded-full ${status.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Tracker Card */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 transition-colors duration-500">
          <h2 className="text-lg font-semibold text-title mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Priority Distribution
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Low', count: stats.bugsByPriority.Low, color: 'text-slate-500 bg-input-bg border-card-border', icon: (
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                label: 'Medium', count: stats.bugsByPriority.Medium, color: 'text-sky-500 bg-sky-500/5 border-sky-500/20', icon: (
                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              },
              {
                label: 'High', count: stats.bugsByPriority.High, color: 'text-orange-500 bg-orange-500/5 border-orange-500/20', icon: (
                  <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )
              },
              {
                label: 'Critical', count: stats.bugsByPriority.Critical, color: 'text-rose-500 bg-rose-500/5 border-rose-500/20', icon: (
                  <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              }
            ].map((prio) => (
              <div
                key={prio.label}
                className={`flex flex-col justify-between p-4 border rounded-xl transition-all ${prio.color}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-semibold uppercase tracking-wider">{prio.label}</span>
                  {prio.icon}
                </div>
                <span className="text-3xl font-bold mt-2">{prio.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-input-bg/40 border border-card-border text-xs text-subtitle transition-colors duration-500">
            <strong>Priority Guide:</strong> High and Critical priority items are flagged for priority resource allocation. Keep open counts minimized.
          </div>
        </div>

      </div>
    </div>
  );
}
