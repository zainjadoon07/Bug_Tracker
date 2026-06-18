'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab state: 'active' or 'deleted'
  const [currentTab, setCurrentTab] = useState('active');

  // Form states for Admin project creation
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for Admin project editing
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // States for Project Details modal (clickable cards)
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Custom Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmButtonText, setConfirmButtonText] = useState('Confirm');
  const [confirmIsDanger, setConfirmIsDanger] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [projectErrors, setProjectErrors] = useState({});

  const handleCloseCreateModal = () => {
    setProjectName('');
    setDescription('');
    setProjectErrors({});
    setShowCreateModal(false);
  };

  const handleCloseEditModal = () => {
    setEditingProject(null);
    setEditProjectName('');
    setEditDescription('');
    setProjectErrors({});
    setShowEditModal(false);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const showDeleted = currentTab === 'deleted';
      const data = await api.getProjects(showDeleted);
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentTab]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    // Custom validation
    const newErrors = {};
    if (!projectName.trim()) {
      newErrors.projectName = "Please enter a project name.";
    }

    if (Object.keys(newErrors).length > 0) {
      setProjectErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.createProject(projectName, description);
      setProjectName('');
      setDescription('');
      setProjectErrors({});
      setShowCreateModal(false);
      await fetchProjects(); // Refresh the list
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    // Custom validation
    const newErrors = {};
    if (!editProjectName.trim()) {
      newErrors.editProjectName = "Please enter a project name.";
    }

    if (Object.keys(newErrors).length > 0) {
      setProjectErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.updateProject(editingProject.project_id, editProjectName, editDescription);
      setEditingProject(null);
      setEditProjectName('');
      setEditDescription('');
      setProjectErrors({});
      setShowEditModal(false);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoftDelete = async (project_id) => {
    try {
      setError('');
      await api.deleteProject(project_id);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to soft-delete project.');
    }
  };

  const handleRestore = async (project_id) => {
    try {
      setError('');
      await api.restoreProject(project_id);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to restore project.');
    }
  };

  const handlePermanentDelete = async (project_id) => {
    try {
      setError('');
      await api.permanentlyDeleteProject(project_id);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to permanently delete project.');
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

  const isAdmin = user?.role === 'Administrator';

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-title flex items-center gap-2">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Projects Directory
          </h1>
          <p className="text-subtitle text-sm mt-1">
            Manage your development projects and allocate defect logs.
          </p>
        </div>
        
        {isAdmin && currentTab === 'active' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-400 ease-in-out shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Tabs (Only visible to Admin) */}
      {isAdmin && (
        <div className="flex gap-6 border-b border-card-border pb-px">
          <button
            onClick={() => setCurrentTab('active')}
            className={`pb-3 text-sm font-semibold tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${
              currentTab === 'active' 
                ? 'text-indigo-500 font-bold border-b-2 border-indigo-500' 
                : 'text-subtitle hover:text-title'
            }`}
          >
            <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Active Projects
          </button>
          <button
            onClick={() => setCurrentTab('deleted')}
            className={`pb-3 text-sm font-semibold tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${
              currentTab === 'deleted' 
                ? 'text-indigo-500 font-bold border-b-2 border-indigo-500' 
                : 'text-subtitle hover:text-title'
            }`}
          >
            <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Recently Deleted</span>
            <span className="bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/20 font-sans">Recycle Bin</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-card-bg border border-card-border rounded-2xl"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card-bg border border-card-border rounded-2xl text-center transition-colors duration-500">
          <div className="p-4 bg-input-bg rounded-full text-slate-400 mb-4 border border-card-border">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-title">
            {currentTab === 'deleted' ? 'No Deleted Projects' : 'No Projects Found'}
          </h3>
          <p className="text-subtitle text-sm max-w-sm mt-1">
            {currentTab === 'deleted' 
              ? 'Projects you soft-delete will be stored here temporarily.' 
              : isAdmin 
                ? 'Click the "New Project" button above to add a new tracking project to your team.' 
                : 'Contact your administrator to register projects.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.project_id}
              onClick={() => {
                setSelectedProjectDetails(proj);
                setShowDetailsModal(true);
              }}
              className="bg-card-bg border border-card-border rounded-2xl p-6 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col justify-between cursor-pointer group hover:scale-[1.01]"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-bold text-title truncate group-hover:text-indigo-400 transition-colors">{proj.project_name}</h3>
                  {isAdmin && currentTab === 'active' && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening details modal
                          setEditingProject(proj);
                          setEditProjectName(proj.project_name);
                          setEditDescription(proj.description || '');
                          setShowEditModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening details modal
                          triggerConfirmation(
                            'Move Project to Recycle Bin',
                            `Are you sure you want to soft-delete "${proj.project_name}"? This project will be transferred to Recently Deleted repository.`,
                            () => handleSoftDelete(proj.project_id),
                            'Delete',
                            true
                          );
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
                        title="Move to Recycle Bin"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-subtitle text-sm mt-2 line-clamp-3 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="border-t border-card-border pt-4 mt-6 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs text-subtitle font-sans">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Manager: <strong className="text-title font-semibold">{proj.owner?.name || 'Admin'}</strong></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
                
                {isAdmin && currentTab === 'deleted' && (
                  <div className="flex gap-2 pt-2 border-t border-card-border/50 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening details modal
                        triggerConfirmation(
                          'Restore Project',
                          `Are you sure you want to restore "${proj.project_name}" back to the active projects list?`,
                          () => handleRestore(proj.project_id),
                          'Restore',
                          false
                        );
                      }}
                      className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
                      </svg>
                      Restore
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening details modal
                        triggerConfirmation(
                          'Permanently Delete Project',
                          `Are you sure you want to permanently purge "${proj.project_name}"? This action cannot be undone and will delete all associated ticket logs!`,
                          () => handlePermanentDelete(proj.project_id),
                          'Purge',
                          true
                        );
                      }}
                      className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Purge
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin creation dialog (modal) */}
      {showCreateModal && (
        <div 
          onClick={handleCloseCreateModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-card-bg border border-card-border rounded-3xl w-full max-w-lg p-8 shadow-2xl relative transition-colors duration-500 cursor-default"
          >
            <button
              onClick={handleCloseCreateModal}
              className="absolute top-4 right-4 text-subtitle hover:text-title text-xl p-2 cursor-pointer"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-title mb-6 font-f1">Create New Project</h2>
            
            <form onSubmit={handleCreateProject} noValidate className="space-y-6">
              <div>
                <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile Banking App"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setProjectErrors(prev => ({ ...prev, projectName: '' }));
                  }}
                  className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none transition-all font-sans ${
                    projectErrors.projectName 
                      ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                      : 'border-input-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {projectErrors.projectName && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-sans">
                    ⚠️ {projectErrors.projectName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Summarize the project's purpose and scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none font-sans"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="w-1/2 bg-card-bg hover:bg-input-bg border border-card-border hover:border-slate-400 text-title font-medium py-3 rounded-xl transition-all duration-300 cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-400 ease-in-out shadow-lg shadow-indigo-500/20 cursor-pointer font-sans"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin edit dialog (modal) */}
      {showEditModal && (
        <div 
          onClick={handleCloseEditModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-card-bg border border-card-border rounded-3xl w-full max-w-lg p-8 shadow-2xl relative transition-colors duration-500 cursor-default"
          >
            <button
              onClick={handleCloseEditModal}
              className="absolute top-4 right-4 text-subtitle hover:text-title text-xl p-2 cursor-pointer"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-title mb-6 font-f1">Edit Project</h2>
            
            <form onSubmit={handleUpdateProject} noValidate className="space-y-6">
              <div>
                <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile Banking App"
                  value={editProjectName}
                  onChange={(e) => {
                    setEditProjectName(e.target.value);
                    setProjectErrors(prev => ({ ...prev, editProjectName: '' }));
                  }}
                  className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none transition-all font-sans ${
                    projectErrors.editProjectName 
                      ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                      : 'border-input-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                />
                {projectErrors.editProjectName && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-sans">
                    ⚠️ {projectErrors.editProjectName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-label text-xs font-semibold uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Summarize the project's purpose and scope..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-page-fg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none font-sans"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="w-1/2 bg-card-bg hover:bg-input-bg border border-card-border hover:border-slate-400 text-title font-medium py-3 rounded-xl transition-all duration-300 cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-400 ease-in-out shadow-lg shadow-indigo-500/20 cursor-pointer font-sans"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clickable Project Details Modal */}
      {showDetailsModal && selectedProjectDetails && (
        <div 
          onClick={() => {
            setShowDetailsModal(false);
            setSelectedProjectDetails(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-card-bg border border-card-border rounded-3xl w-full max-w-lg p-8 shadow-2xl relative transition-colors duration-500 cursor-default"
          >
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedProjectDetails(null);
              }}
              className="absolute top-4 right-4 text-subtitle hover:text-title text-xl p-2 cursor-pointer"
            >
              ×
            </button>
            <div className="mb-4">
              <span className="text-[10px] font-bold text-indigo-400 tracking-wide uppercase bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10">
                Project Scope Details
              </span>
            </div>
            <h2 className="text-2xl font-bold text-title mb-4 font-f1">{selectedProjectDetails.project_name}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-label mb-2">Description</h3>
                <div className="bg-input-bg border border-input-border rounded-xl p-4 text-sm text-page-fg leading-relaxed max-h-48 overflow-y-auto font-sans">
                  {selectedProjectDetails.description || 'No description provided.'}
                </div>
              </div>

              <div className="border-t border-card-border pt-4 grid grid-cols-2 gap-4 text-xs text-subtitle">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-label mb-1">Project Manager</span>
                  <span className="text-title font-semibold text-sm">{selectedProjectDetails.owner?.name || 'Admin'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-label mb-1">Email Contact</span>
                  <span className="text-title font-semibold text-sm truncate block select-all">{selectedProjectDetails.owner?.email || 'admin@bugtracker.com'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-label mb-1">Date Registered</span>
                  <span className="text-title font-semibold text-sm">{new Date(selectedProjectDetails.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-label mb-1">Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedProjectDetails.deleted_at 
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {selectedProjectDetails.deleted_at ? 'Deleted' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProjectDetails(null);
                }}
                className="bg-input-bg hover:bg-slate-800 border border-card-border text-title font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer font-sans"
              >
                Close Scope
              </button>
            </div>
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
                className={`w-1/2 text-white font-medium py-3 rounded-xl transition-all duration-400 ease-in-out shadow-lg cursor-pointer text-sm font-sans ${
                  confirmIsDanger 
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
