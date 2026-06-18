'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

export default function BugsPage() {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab state: 'active', 'recent', or 'deleted'
  const [currentTab, setCurrentTab] = useState('active');

  // Filters state
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Local search query
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for Tester reporting bug
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportProjectId, setReportProjectId] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportPriority, setReportPriority] = useState('Medium');
  const [reportSeverity, setReportSeverity] = useState('Minor');
  const [reporting, setReporting] = useState(false);
  const [reportErrors, setReportErrors] = useState({});

  // Custom dropdown open/close states (Filters)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);

  // Custom dropdown open/close states (Report Form)
  const [formProjectDropdownOpen, setFormProjectDropdownOpen] = useState(false);
  const [formPriorityDropdownOpen, setFormPriorityDropdownOpen] = useState(false);
  const [formSeverityDropdownOpen, setFormSeverityDropdownOpen] = useState(false);

  // Custom Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmButtonText, setConfirmButtonText] = useState('Confirm');
  const [confirmIsDanger, setConfirmIsDanger] = useState(false);

  // Fetch bugs with current filters
  const fetchBugs = async () => {
    try {
      setLoading(true);
      setError('');

      const filterParams = {};
      if (selectedProject) filterParams.project_id = selectedProject;
      if (selectedStatus) filterParams.status = selectedStatus;
      if (selectedPriority) filterParams.priority = selectedPriority;
      if (selectedAssignee) filterParams.assigned_user = selectedAssignee;

      if (currentTab === 'deleted') {
        filterParams.deleted = 'true';
      }

      const data = await api.getBugs(filterParams);
      setBugs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load bugs directory.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial setup data: projects and users
  const fetchFilterOptions = async () => {
    try {
      const activeProjects = await api.getProjects(false);
      setProjects(activeProjects);

      const allUsers = await api.getUsers();
      setUsers(allUsers.filter(u => u.role === 'Developer' || u.role === 'Administrator'));
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [selectedProject, selectedStatus, selectedPriority, selectedAssignee, currentTab]);

  const handleReportBug = async (e) => {
    e.preventDefault();

    // Custom validation
    const newErrors = {};
    if (!reportProjectId) {
      newErrors.projectId = "Please select a project before reporting a bug.";
    }
    if (!reportTitle.trim()) {
      newErrors.title = "Please provide a bug title.";
    }
    if (!reportDescription.trim()) {
      newErrors.description = "Please provide a technical description and steps to reproduce.";
    }

    if (Object.keys(newErrors).length > 0) {
      setReportErrors(newErrors);
      return;
    }

    setReporting(true);
    setError('');

    try {
      await api.createBug({
        project_id: parseInt(reportProjectId),
        title: reportTitle,
        description: reportDescription,
        priority: reportPriority,
        severity: reportSeverity
      });

      // Clear report fields, error states, and close modal
      setReportProjectId('');
      setReportTitle('');
      setReportDescription('');
      setReportPriority('Medium');
      setReportSeverity('Minor');
      setReportErrors({});
      setShowReportModal(false);

      // Refresh directory
      await fetchBugs();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to file bug report.');
    } finally {
      setReporting(false);
    }
  };

  const handleCloseReportModal = () => {
    setReportProjectId('');
    setReportTitle('');
    setReportDescription('');
    setReportPriority('Medium');
    setReportSeverity('Minor');
    setReportErrors({});
    setShowReportModal(false);
  };

  const handleRestoreBug = async (bugId) => {
    try {
      setError('');
      await api.restoreBug(bugId);
      await fetchBugs();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to restore bug.');
    }
  };

  const handlePermanentDeleteBug = async (bugId) => {
    try {
      setError('');
      await api.permanentlyDeleteBug(bugId);
      await fetchBugs();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to permanently delete bug.');
    }
  };

  const triggerConfirmation = (title, message, action, buttonText = 'Confirm', isDanger = false) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmButtonText(buttonText);
    setConfirmIsDanger(isDanger);
    setShowConfirmModal(true);
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

  const getAvatarStyle = (name) => {
    if (!name) return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    const styles = [
      'bg-violet-500/10 text-violet-400 border border-violet-500/20',
      'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      'bg-pink-500/10 text-pink-400 border border-pink-500/20',
      'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return styles[sum % styles.length];
  };

  // Filter fetched bugs locally by search query and active/recent statuses
  const filteredBugs = bugs.filter(bug => {
    if (currentTab === 'active' && bug.status === 'Closed') return false;
    if (currentTab === 'recent' && bug.status !== 'Closed') return false;

    const titleMatch = bug.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = bug.description.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch;
  });

  const isTester = user?.role === 'Tester';
  const isAdmin = user?.role === 'Administrator';

  // Badge / Option helper colors
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-rose-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityDotColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Blocker': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Major': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Minor': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case 'Blocker': return 'text-purple-400';
      case 'Major': return 'text-rose-400';
      case 'Minor': return 'text-sky-400';
      default: return 'text-slate-400';
    }
  };

  const getSeverityDotColor = (severity) => {
    switch (severity) {
      case 'Blocker': return 'bg-purple-500';
      case 'Major': return 'bg-rose-500';
      case 'Minor': return 'bg-sky-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'Assigned': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'In Progress': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case 'Testing': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Closed': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Open': return 'text-sky-400';
      case 'Assigned': return 'text-indigo-400';
      case 'In Progress': return 'text-violet-400';
      case 'Testing': return 'text-amber-400';
      case 'Resolved': return 'text-emerald-400';
      case 'Closed': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-sky-500';
      case 'Assigned': return 'bg-indigo-500';
      case 'In Progress': return 'bg-violet-500';
      case 'Testing': return 'bg-amber-500';
      case 'Resolved': return 'bg-emerald-500';
      case 'Closed': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-title flex items-center gap-2">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Bugs Directory
          </h1>
          <p className="text-subtitle text-sm mt-1">
            Browse, filter, and track defect files reported across current projects.
          </p>
        </div>

        {isTester && currentTab === 'active' && (
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-400 ease-in-out shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Bug
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-6 border-b border-card-border pb-px">
        <button
          onClick={() => setCurrentTab('active')}
          className={`pb-3 text-sm font-semibold tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${currentTab === 'active'
              ? 'text-indigo-500 font-bold border-b-2 border-indigo-500'
              : 'text-subtitle hover:text-title'
            }`}
        >
          <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Active Bugs
        </button>
        <button
          onClick={() => setCurrentTab('recent')}
          className={`pb-3 text-sm font-semibold tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${currentTab === 'recent'
              ? 'text-indigo-500 font-bold border-b-2 border-indigo-500'
              : 'text-subtitle hover:text-title'
            }`}
        >
          <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Recent Bugs</span>
          <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/20 font-sans">Cleared</span>
        </button>
        {isAdmin && (
          <button
            onClick={() => setCurrentTab('deleted')}
            className={`pb-3 text-sm font-semibold tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${currentTab === 'deleted'
                ? 'text-indigo-500 font-bold border-b-2 border-indigo-500'
                : 'text-subtitle hover:text-title'
              }`}
          >
            <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Recycle Bin</span>
            <span className="bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/20 font-sans">Admin Only</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 transition-all duration-500 z-30 relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <label className="block text-label text-[10px] font-bold uppercase tracking-wider mb-1.5">Search Bugs</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input-bg border border-input-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-page-fg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Custom Project Filter Dropdown */}
          <div className="relative">
            <label className="block text-label text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Project</label>
            <button
              type="button"
              onClick={() => {
                setProjectDropdownOpen(!projectDropdownOpen);
                setStatusDropdownOpen(false);
                setPriorityDropdownOpen(false);
              }}
              className="w-full bg-input-bg border border-input-border rounded-xl px-3.5 py-2.5 text-sm text-page-fg focus:outline-none focus:border-indigo-500 transition-all flex items-center justify-between font-semibold cursor-pointer truncate"
            >
              <span className="truncate">
                {selectedProject ? projects.find(p => p.project_id.toString() === selectedProject.toString())?.project_name : 'All Projects'}
              </span>
              <svg className="w-4 h-4 text-slate-500 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {projectDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProjectDropdownOpen(false)}></div>
                <div className="absolute left-0 right-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 max-h-48 overflow-y-auto animate-fadeIn font-semibold">
                  <button
                    type="button"
                    onClick={() => { setSelectedProject(''); setProjectDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-input-bg/60 text-slate-400 transition-colors"
                  >
                    All Projects
                  </button>
                  {projects.map((p) => (
                    <button
                      key={p.project_id}
                      type="button"
                      onClick={() => { setSelectedProject(p.project_id); setProjectDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-input-bg/60 text-slate-300 transition-colors truncate font-sans block"
                    >
                      {p.project_name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Custom Status Filter Dropdown */}
          <div className="relative">
            <label className="block text-label text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Status</label>
            <button
              type="button"
              disabled={currentTab === 'recent'}
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setProjectDropdownOpen(false);
                setPriorityDropdownOpen(false);
              }}
              className="w-full bg-input-bg border border-input-border rounded-xl px-3.5 py-2.5 text-sm text-page-fg focus:outline-none focus:border-indigo-500 transition-all flex items-center justify-between font-semibold cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {currentTab === 'recent' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                    <span className="text-slate-400">Closed</span>
                  </>
                ) : selectedStatus ? (
                  <>
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(selectedStatus)}`}></span>
                    <span className={getStatusTextColor(selectedStatus)}>{selectedStatus}</span>
                  </>
                ) : (
                  <span className="text-slate-400 font-sans">All Statuses</span>
                )}
              </span>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {statusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)}></div>
                <div className="absolute left-0 right-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden animate-fadeIn font-semibold">
                  <button
                    type="button"
                    onClick={() => { setSelectedStatus(''); setStatusDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-input-bg/60 text-slate-400 transition-colors"
                  >
                    All Statuses
                  </button>
                  {['Open', 'Assigned', 'In Progress', 'Testing', 'Resolved', 'Closed'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setSelectedStatus(s); setStatusDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-input-bg/60 transition-colors flex items-center gap-2 font-sans"
                    >
                      <span className={`w-2 h-2 rounded-full ${getStatusDotColor(s)}`}></span>
                      <span className={getStatusTextColor(s)}>{s}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Custom Priority Filter Dropdown */}
          <div className="relative">
            <label className="block text-label text-[10px] font-bold uppercase tracking-wider mb-1.5 font-sans">Priority</label>
            <button
              type="button"
              onClick={() => {
                setPriorityDropdownOpen(!priorityDropdownOpen);
                setProjectDropdownOpen(false);
                setStatusDropdownOpen(false);
              }}
              className="w-full bg-input-bg border border-input-border rounded-xl px-3.5 py-2.5 text-sm text-page-fg focus:outline-none focus:border-indigo-500 transition-all flex items-center justify-between font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {selectedPriority ? (
                  <>
                    <span className={`w-2.5 h-2.5 rounded-full ${getPriorityDotColor(selectedPriority)}`}></span>
                    <span className={getPriorityTextColor(selectedPriority)}>{selectedPriority}</span>
                  </>
                ) : (
                  <span className="text-slate-400 font-sans">All Priorities</span>
                )}
              </span>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {priorityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPriorityDropdownOpen(false)}></div>
                <div className="absolute left-0 right-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden animate-fadeIn font-semibold">
                  <button
                    type="button"
                    onClick={() => { setSelectedPriority(''); setPriorityDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-input-bg/60 text-slate-400 transition-colors"
                  >
                    All Priorities
                  </button>
                  {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setSelectedPriority(p); setPriorityDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-input-bg/60 transition-colors flex items-center gap-2 font-sans"
                    >
                      <span className={`w-2 h-2 rounded-full ${getPriorityDotColor(p)}`}></span>
                      <span className={getPriorityTextColor(p)}>{p}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bugs List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-card-bg border border-card-border rounded-2xl"></div>
          ))}
        </div>
      ) : filteredBugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card-bg border border-card-border rounded-2xl text-center transition-colors duration-500">
          <div className="p-4 bg-input-bg rounded-full text-slate-400 mb-4 border border-card-border">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-title">
            {currentTab === 'deleted' ? 'No Deleted Bugs' : currentTab === 'recent' ? 'No Cleared Bugs' : 'No Active Bugs'}
          </h3>
          <p className="text-subtitle text-sm max-w-sm mt-1">
            {currentTab === 'deleted'
              ? 'Soft-deleted bugs reside here for permanent delete or restore.'
              : currentTab === 'recent'
                ? 'Bugs that have been successfully resolved and cleared will display here.'
                : 'All open development defect tickets show in this dashboard.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBugs.map((bug) => (
            <div
              key={bug.bug_id}
              className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <Link
                  href={`/dashboard/bugs/${bug.bug_id}`}
                  className="space-y-2 flex-1 min-w-0 cursor-pointer block"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-sans shrink-0 select-none ${getAvatarStyle(bug.reporter?.name)}`} title={`Reporter: ${bug.reporter?.name || 'Unknown'}`}>
                        {getInitials(bug.reporter?.name)}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-400 tracking-wide uppercase bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10 font-mono">
                        BUG-{bug.bug_id}
                      </span>
                    </div>
                    <span className="text-xs text-subtitle font-medium truncate max-w-[200px]">
                      {bug.project?.project_name}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-title group-hover:text-indigo-400 transition-colors truncate">
                    {bug.title}
                  </h3>
                  <p className="text-subtitle text-xs line-clamp-1 leading-relaxed font-sans mb-1">
                    {bug.description}
                  </p>

                  {/* Upfront Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-card-border/30 text-[10px] text-subtitle font-sans select-none">
                    <span className="text-slate-500">Reported by:</span>
                    <span className="text-title font-semibold">{bug.reporter?.name || 'Unknown'}</span>
                    <span className="text-slate-600">•</span>
                    <span>{new Date(bug.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Priority Badge */}
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(bug.priority)}`}>
                    {bug.priority}
                  </span>

                  {/* Severity Badge */}
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(bug.severity)}`}>
                    {bug.severity}
                  </span>

                  {/* Status Badge */}
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(bug.status)}`}>
                    {bug.status}
                  </span>

                  {/* Assignee display */}
                  <div className="text-xs text-right hidden sm:block pl-2 border-l border-card-border font-sans">
                    <div className="text-[10px] text-subtitle uppercase font-semibold">Assignee</div>
                    <div className="text-title font-semibold mt-0.5">
                      {bug.assignee?.name || <span className="text-amber-500/70 italic font-normal">Unassigned</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recycle Bin Controls for Bugs */}
              {isAdmin && currentTab === 'deleted' && (
                <div className="flex gap-2 pt-4 mt-4 border-t border-card-border/50 justify-end shrink-0">
                  <button
                    onClick={() => {
                      triggerConfirmation(
                        'Restore Bug Defect',
                        `Are you sure you want to restore BUG-${bug.bug_id}: "${bug.title}"?`,
                        () => handleRestoreBug(bug.bug_id),
                        'Restore',
                        false
                      );
                    }}
                    className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer font-sans"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
                    </svg>
                    Restore Bug
                  </button>
                  <button
                    onClick={() => {
                      triggerConfirmation(
                        'Permanently Purge Bug',
                        `Are you sure you want to permanently purge BUG-${bug.bug_id}: "${bug.title}"? This cannot be undone and will wipe all discussion threads!`,
                        () => handlePermanentDeleteBug(bug.bug_id),
                        'Purge Bug',
                        true
                      );
                    }}
                    className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer font-sans"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Purge Bug
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tester report dialog (modal) */}
      {showReportModal && (
        <div
          onClick={handleCloseReportModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card-bg border border-card-border rounded-3xl w-full max-w-xl p-8 shadow-2xl relative transition-colors duration-500 cursor-default"
          >
            <button
              onClick={handleCloseReportModal}
              className="absolute top-4 right-4 text-subtitle hover:text-title text-xl p-2 cursor-pointer"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-title mb-6 font-f1">Report New Bug</h2>

            <form onSubmit={handleReportBug} noValidate className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3 relative">
                  <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2">
                    Project
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormProjectDropdownOpen(!formProjectDropdownOpen)}
                    className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-left text-page-fg focus:outline-none transition-all flex items-center justify-between font-semibold cursor-pointer ${reportErrors.projectId
                        ? 'border-rose-500/50 focus:border-rose-500'
                        : 'border-input-border focus:border-indigo-500'
                      }`}
                  >
                    <span>
                      {reportProjectId ? projects.find(p => p.project_id.toString() === reportProjectId.toString())?.project_name : 'Select Project'}
                    </span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {reportErrors.projectId && (
                    <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-sans">
                      ⚠️ {reportErrors.projectId}
                    </p>
                  )}
                  {formProjectDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setFormProjectDropdownOpen(false)}></div>
                      <div className="absolute left-0 right-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 max-h-48 overflow-y-auto animate-fadeIn font-semibold">
                        {projects.map((p) => (
                          <button
                            key={p.project_id}
                            type="button"
                            onClick={() => {
                              setReportProjectId(p.project_id);
                              setFormProjectDropdownOpen(false);
                              setReportErrors(prev => ({ ...prev, projectId: '' }));
                            }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-input-bg/60 text-slate-300 transition-colors truncate block font-sans"
                          >
                            {p.project_name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2">
                  Bug Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Memory leak on checkout modal"
                  value={reportTitle}
                  onChange={(e) => {
                    setReportTitle(e.target.value);
                    setReportErrors(prev => ({ ...prev, title: '' }));
                  }}
                  className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none transition-all font-sans ${reportErrors.title
                      ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-input-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                />
                {reportErrors.title && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-sans">
                    ⚠️ {reportErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2">
                  Technical Description & Steps to Reproduce
                </label>
                <textarea
                  placeholder="Provide detailed error logs, exact steps, or environments..."
                  value={reportDescription}
                  onChange={(e) => {
                    setReportDescription(e.target.value);
                    setReportErrors(prev => ({ ...prev, description: '' }));
                  }}
                  rows={4}
                  className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none transition-all resize-none font-sans ${reportErrors.description
                      ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-input-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                />
                {reportErrors.description && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-sans">
                    ⚠️ {reportErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2 font-sans">
                    Priority
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormPriorityDropdownOpen(!formPriorityDropdownOpen)}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-left text-page-fg focus:outline-none focus:border-indigo-500 transition-all flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getPriorityDotColor(reportPriority)}`}></span>
                      <span className={getPriorityTextColor(reportPriority)}>{reportPriority}</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {formPriorityDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setFormPriorityDropdownOpen(false)}></div>
                      <div className="absolute left-0 right-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden animate-fadeIn font-semibold">
                        {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => { setReportPriority(p); setFormPriorityDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-input-bg/60 transition-colors flex items-center gap-2 font-sans "
                          >
                            <span className={`w-2 h-2 rounded-full ${getPriorityDotColor(p)}`}></span>
                            <span className={getPriorityTextColor(p)}>{p}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2 font-sans">
                    Severity
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormSeverityDropdownOpen(!formSeverityDropdownOpen)}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-left text-page-fg focus:outline-none focus:border-indigo-500 transition-all flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getSeverityDotColor(reportSeverity)}`}></span>
                      <span className={getSeverityTextColor(reportSeverity)}>{reportSeverity}</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {formSeverityDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setFormSeverityDropdownOpen(false)}></div>
                      <div className="absolute left-0 right-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden animate-fadeIn font-semibold">
                        {['Trivial', 'Minor', 'Major', 'Blocker'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { setReportSeverity(s); setFormSeverityDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-input-bg/60 transition-colors flex items-center gap-2 font-sans "
                          >
                            <span className={`w-2 h-2 rounded-full ${getSeverityDotColor(s)}`}></span>
                            <span className={getSeverityTextColor(s)}>{s}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseReportModal}
                  className="w-1/2 bg-card-bg hover:bg-input-bg border border-card-border hover:border-slate-400 text-title font-medium py-3 rounded-xl transition-all duration-300 cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-400 ease-in-out shadow-lg shadow-indigo-500/20 cursor-pointer font-sans"
                >
                  {reporting ? 'Submitting...' : 'Report Defect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog (Modal) */}
      {showConfirmModal && (
        <div
          onClick={() => {
            setShowConfirmModal(false);
            setConfirmAction(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card-bg border border-card-border rounded-3xl w-full max-w-md p-8 shadow-2xl relative transition-colors duration-500 cursor-default"
          >
            <h2 className="text-xl font-bold text-title mb-4 font-f1">{confirmTitle}</h2>
            <p className="text-subtitle text-sm mb-6 leading-relaxed font-sans">
              {confirmMessage}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="w-1/2 bg-card-bg hover:bg-input-bg border border-card-border hover:border-slate-400 text-title font-medium py-3 rounded-xl transition-all duration-300 cursor-pointer text-sm font-sans"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className={`w-1/2 text-white font-medium py-3 rounded-xl transition-all duration-400 ease-in-out shadow-lg cursor-pointer text-sm font-sans ${confirmIsDanger
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/10 hover:shadow-rose-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10 hover:shadow-indigo-500/30'
                  }`}
              >
                {confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
