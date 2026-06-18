'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentAudits, setRecentAudits] = useState([]);
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

      try {
        const auditsData = await api.getRecentAudits();
        setRecentAudits(auditsData);
      } catch (auditErr) {
        console.error('Failed to fetch recent audits:', auditErr);
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

  // Donut chart calculations
  const totalBugs = stats.totalBugs || 0;
  const statusSegments = [
    { label: 'Open', count: stats.bugsByStatus.Open || 0, color: '#0ea5e9' },
    { label: 'Assigned', count: stats.bugsByStatus.Assigned || 0, color: '#6366f1' },
    { label: 'In Progress', count: stats.bugsByStatus.InProgress || 0, color: '#8b5cf6' },
    { label: 'Testing', count: stats.bugsByStatus.Testing || 0, color: '#f59e0b' },
    { label: 'Resolved', count: stats.bugsByStatus.Resolved || 0, color: '#10b981' },
    { label: 'Closed', count: stats.bugsByStatus.Closed || 0, color: '#64748b' }
  ];

  let accumulatedPercentage = 0;

  // Bar chart calculations
  const prioData = [
    { label: 'Low', count: stats.bugsByPriority.Low || 0, color: '#64748b' },
    { label: 'Medium', count: stats.bugsByPriority.Medium || 0, color: '#38bdf8' },
    { label: 'High', count: stats.bugsByPriority.High || 0, color: '#fb923c' },
    { label: 'Critical', count: stats.bugsByPriority.Critical || 0, color: '#f43f5e' }
  ];

  const maxPrioCount = Math.max(...prioData.map(d => d.count), 1);

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

      {/* Staff Counts & Recent System Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Registered Staff Counts (gated to admin) */}
        {isAdmin && (
          <div className="lg:col-span-1 bg-card-bg border border-card-border rounded-2xl p-6 transition-colors duration-500 animate-fadeIn flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-title mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Registered Staff
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-input-bg border border-card-border rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-subtitle text-[10px] font-bold uppercase tracking-wider">Admins</span>
                  <span className="text-xl font-bold text-violet-400 mt-1 font-mono">{users.filter(u => u.role === 'Administrator').length}</span>
                </div>
                <div className="bg-input-bg border border-card-border rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-subtitle text-[10px] font-bold uppercase tracking-wider">Developers</span>
                  <span className="text-xl font-bold text-sky-400 mt-1 font-mono">{users.filter(u => u.role === 'Developer').length}</span>
                </div>
                <div className="bg-input-bg border border-card-border rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-subtitle text-[10px] font-bold uppercase tracking-wider">Testers</span>
                  <span className="text-xl font-bold text-amber-400 mt-1 font-mono">{users.filter(u => u.role === 'Tester').length}</span>
                </div>
                <div className="bg-input-bg border border-card-border rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-subtitle text-[10px] font-bold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-bold text-white mt-1 font-mono">{users.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent System Activity Timeline */}
        <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} bg-card-bg border border-card-border rounded-2xl p-6 transition-colors duration-500`}>
          <h2 className="text-lg font-semibold text-title mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Activity Feed
          </h2>
          {recentAudits.length === 0 ? (
            <div className="text-center py-6 text-subtitle text-xs">
              No recent activities registered. Keep reporting defects to sync the feed.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[160px] overflow-y-auto pr-2">
              {recentAudits.map((log) => {
                let textAction = '';
                try {
                  const data = JSON.parse(log.details);
                  if (log.action_type === 'BUG_CREATED') {
                    textAction = `filed BUG-${log.bug_id || ''}: "${data.title}"`;
                  } else if (log.action_type === 'STATUS_CHANGED') {
                    textAction = `changed status of BUG-${log.bug_id || ''} to "${data.new_status}"`;
                  } else if (log.action_type === 'TICKET_ASSIGNED') {
                    textAction = `assigned BUG-${log.bug_id || ''} to "${data.new_assignee}"`;
                  } else if (log.action_type === 'COMMENT_ADDED') {
                    textAction = `commented on BUG-${log.bug_id || ''}: "${data.comment_message}"`;
                  } else if (log.action_type === 'COMMENT_DELETED') {
                    textAction = `deleted comment of ${data.author_name || 'user'} on BUG-${log.bug_id || ''}: "${data.comment_message}"`;
                  } else if (log.action_type === 'TICKET_DELETED') {
                    textAction = `deleted BUG-${log.bug_id || ''}: "${data.title}"`;
                  } else if (log.action_type === 'TICKET_RESTORED') {
                    textAction = `restored BUG-${log.bug_id || ''}: "${data.title}"`;
                  } else if (log.action_type === 'TICKET_PURGED') {
                    textAction = `purged bug: "${data.title}"`;
                  }
                } catch (e) {
                  textAction = log.details;
                }

                return (
                  <div key={log.log_id} className="flex items-start gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 animate-pulse" />
                    <div className="min-w-0">
                      <p className="text-slate-400 leading-relaxed truncate">
                        <strong className="text-title font-semibold">{log.user?.name || 'Someone'}</strong>{' '}
                        {textAction}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            {/* SVG Donut Chart */}
            <div className="md:col-span-2 flex justify-center relative">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="rgba(100, 116, 139, 0.1)"
                  strokeWidth="20"
                />
                {totalBugs === 0 ? (
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#475569"
                    strokeWidth="20"
                  />
                ) : (
                  statusSegments.map((seg) => {
                    if (seg.count === 0) return null;
                    const percentage = (seg.count / totalBugs) * 100;
                    const strokeLength = (percentage / 100) * 439.82;
                    const offset = (accumulatedPercentage / 100) * 439.82;
                    accumulatedPercentage += percentage;

                    return (
                      <circle
                        key={seg.label}
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="20"
                        strokeDasharray={`${strokeLength} 439.82`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-300 hover:stroke-24"
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })
                )}
              </svg>
              {/* Inner text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none font-sans">
                <span className="text-2xl font-black text-title font-mono">{totalBugs}</span>
                <span className="text-[10px] font-bold text-subtitle uppercase tracking-widest">Total</span>
              </div>
            </div>

            {/* Status list legend */}
            <div className="md:col-span-3 space-y-3">
              {statusSegments.map((status) => {
                const percentage = totalBugs > 0 ? (status.count / totalBugs) * 100 : 0;
                return (
                  <div key={status.label}>
                    <div className="flex justify-between text-xs font-semibold text-subtitle mb-1 items-center font-sans">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
                        {status.label}
                      </span>
                      <span>{status.count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-input-bg border border-card-border rounded-full h-1.5 transition-colors duration-500">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: status.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            {/* SVG Bar Chart */}
            <div className="md:col-span-2 flex justify-center">
              <svg className="w-full max-w-[180px] h-40" viewBox="0 0 200 160">
                {prioData.map((d, idx) => {
                  const barHeight = (d.count / maxPrioCount) * 100;
                  const x = 15 + idx * 45;
                  const y = 120 - barHeight;
                  const barWidth = 28;
                  const rx = 4;

                  // Create path with rounded top corners
                  const pathData = `
                    M ${x} 120
                    L ${x} ${y + rx}
                    Q ${x} ${y} ${x + rx} ${y}
                    L ${x + barWidth - rx} ${y}
                    Q ${x + barWidth} ${y} ${x + barWidth} ${y + rx}
                    L ${x + barWidth} 120
                    Z
                  `;

                  return (
                    <g key={d.label} className="group/bar cursor-pointer">
                      {/* Bar */}
                      <path
                        d={pathData}
                        fill={d.color}
                        className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                      {/* Count value */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fill="var(--color-text-title)"
                        className="text-[10px] font-bold font-mono"
                      >
                        {d.count}
                      </text>
                      {/* Label under the bar */}
                      <text
                        x={x + barWidth / 2}
                        y="135"
                        textAnchor="middle"
                        fill="var(--color-text-subtitle)"
                        className="text-[9px] font-bold uppercase tracking-wider font-sans"
                      >
                        {d.label[0]}
                      </text>
                    </g>
                  );
                })}
                {/* Baseline */}
                <line x1="10" y1="120" x2="190" y2="120" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Grid cell details */}
            <div className="md:col-span-3 grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Low', count: stats.bugsByPriority.Low, color: 'text-slate-500 bg-input-bg border-card-border', icon: (
                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  label: 'Medium', count: stats.bugsByPriority.Medium, color: 'text-sky-500 bg-sky-500/5 border-sky-500/20', icon: (
                    <svg className="w-4 h-4 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                },
                {
                  label: 'High', count: stats.bugsByPriority.High, color: 'text-orange-500 bg-orange-500/5 border-orange-500/20', icon: (
                    <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )
                },
                {
                  label: 'Critical', count: stats.bugsByPriority.Critical, color: 'text-rose-500 bg-rose-500/5 border-rose-500/20', icon: (
                    <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )
                }
              ].map((prio) => (
                <div
                  key={prio.label}
                  className={`flex flex-col justify-between p-3 border rounded-xl transition-all ${prio.color}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-sans">{prio.label}</span>
                    {prio.icon}
                  </div>
                  <span className="text-2xl font-bold mt-1 font-mono">{prio.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-input-bg/40 border border-card-border text-xs text-subtitle transition-colors duration-500">
            <strong>Priority Guide:</strong> High and Critical priority items are flagged for priority resource allocation. Keep open counts minimized.
          </div>
        </div>

      </div>
    </div>
  );
}
