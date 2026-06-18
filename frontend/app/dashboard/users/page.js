'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve system user credentials and metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Administrator') {
      fetchUsers();
    }
  }, [user]);

  if (!user) return null;
  const isAdmin = user.role === 'Administrator';

  // 403 Access Gated Page
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card-bg border border-card-border rounded-3xl transition-colors duration-500 animate-fadeIn">
        <div className="p-4 bg-rose-500/10 rounded-full text-rose-400 mb-6 border border-rose-500/20 animate-bounce">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-title font-f1 tracking-wide uppercase">403 - Access Denied</h2>
        <p className="text-subtitle text-sm mt-3 max-w-md leading-relaxed font-sans">
          The requested resource is restricted to system Administrators. Your current role is <strong className="text-rose-400">{user.role}</strong>.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-input-bg rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card-bg border border-card-border rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-card-bg border border-card-border rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card-bg border border-card-border rounded-2xl text-center transition-colors duration-500">
        <div className="p-3 bg-rose-500/10 rounded-full text-rose-400 mb-4 border border-rose-500/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-title">Retrieval Failed</h3>
        <p className="text-subtitle text-sm mt-1 max-w-xs">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const getRoleColors = (role) => {
    switch (role) {
      case 'Administrator':
        return {
          badge: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
          avatar: 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
        };
      case 'Developer':
        return {
          badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
          avatar: 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
        };
      case 'Tester':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          avatar: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
          avatar: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Filter users by search term and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate headcount counts
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'Administrator').length;
  const devCount = users.filter((u) => u.role === 'Developer').length;
  const testerCount = users.filter((u) => u.role === 'Tester').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-title flex items-center gap-2">
          <svg className="w-8 h-8 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          System Users Directory
        </h1>
        <p className="text-subtitle text-sm mt-1">
          Monitor registration credentials, system scopes, and total defect workloads for active members.
        </p>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          { 
            title: 'Total Members', 
            value: totalCount, 
            color: 'text-white',
            borderColor: 'border-card-border/40',
            icon: (
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          },
          { 
            title: 'Administrators', 
            value: adminCount, 
            color: 'text-violet-400',
            borderColor: 'border-violet-500/20',
            icon: (
              <svg className="w-5 h-5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )
          },
          { 
            title: 'Developers', 
            value: devCount, 
            color: 'text-sky-400',
            borderColor: 'border-sky-500/20',
            icon: (
              <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            )
          },
          { 
            title: 'Testers', 
            value: testerCount, 
            color: 'text-amber-400',
            borderColor: 'border-amber-500/20',
            icon: (
              <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            )
          }
        ].map((card) => (
          <div
            key={card.title}
            className={`bg-card-bg border ${card.borderColor} rounded-2xl p-5 transition-all hover:scale-[1.01] shadow-sm transition-colors duration-500 flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <span className="block text-subtitle text-[10px] font-bold uppercase tracking-wider">
                {card.title}
              </span>
              {card.icon}
            </div>
            <span className={`block text-3xl font-bold mt-2 font-mono ${card.color}`}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors duration-500 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md flex items-center">
          <div className="absolute left-4 text-slate-500 pointer-events-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-bg border border-input-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-page-fg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['All', 'Administrator', 'Developer', 'Tester'].map((role) => {
            let roleIcon = null;
            if (role === 'All') {
              roleIcon = (
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              );
            } else if (role === 'Administrator') {
              roleIcon = (
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              );
            } else if (role === 'Developer') {
              roleIcon = (
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              );
            } else if (role === 'Tester') {
              roleIcon = (
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              );
            }

            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  roleFilter === role
                    ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
                    : 'bg-input-bg border-input-border text-subtitle hover:text-title hover:border-slate-400'
                }`}
              >
                {roleIcon}
                {role === 'All' ? 'All Roles' : role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden transition-colors duration-500 shadow-md">
        {filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="p-4 bg-input-bg rounded-full text-slate-500 mb-4 inline-block border border-card-border">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-title">No matching members</h3>
            <p className="text-subtitle text-sm mt-1">
              Try adjusting your query terms or filtering options to locate registered accounts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-input-bg/30">
                  <th className="text-label text-[10px] font-bold uppercase tracking-wider text-left py-4 px-6 border-b border-card-border/60">
                    System Identity
                  </th>
                  <th className="text-label text-[10px] font-bold uppercase tracking-wider text-left py-4 px-6 border-b border-card-border/60">
                    Assigned Role
                  </th>
                  <th className="text-label text-[10px] font-bold uppercase tracking-wider text-center py-4 px-6 border-b border-card-border/60">
                    Reported
                  </th>
                  <th className="text-label text-[10px] font-bold uppercase tracking-wider text-center py-4 px-6 border-b border-card-border/60">
                    Active Assigned
                  </th>
                  <th className="text-label text-[10px] font-bold uppercase tracking-wider text-center py-4 px-6 border-b border-card-border/60">
                    Resolved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {filteredUsers.map((u) => {
                  const colors = getRoleColors(u.role);
                  return (
                    <tr
                      key={u.user_id}
                      className="hover:bg-input-bg/20 transition-colors"
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none shrink-0 ${colors.avatar}`}>
                            {getInitials(u.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-title text-sm truncate">{u.name}</span>
                            <span className="text-subtitle text-xs truncate">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors.badge}`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Bugs Reported */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-semibold font-mono ${
                          u.reportedCount > 0 
                            ? 'bg-slate-800 text-slate-300 border border-card-border' 
                            : 'text-slate-600'
                        }`}>
                          {u.reportedCount}
                        </span>
                      </td>

                      {/* Bugs Assigned */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-semibold font-mono ${
                          u.assignedCount > 0 
                            ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20' 
                            : 'text-slate-600'
                        }`}>
                          {u.assignedCount}
                        </span>
                      </td>

                      {/* Bugs Resolved */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-semibold font-mono ${
                          u.resolvedCount > 0 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
                            : 'text-slate-600'
                        }`}>
                          {u.resolvedCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
