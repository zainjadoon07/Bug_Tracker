'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';

export default function BugDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Input states
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentErrors, setCommentErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  // Comment Editing States
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Ticket Audit Logs States
  const [auditLogs, setAuditLogs] = useState([]);

  // Custom Dropdown Open/Close states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);

  // Custom Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmButtonText, setConfirmButtonText] = useState('Confirm');
  const [confirmIsDanger, setConfirmIsDanger] = useState(false);

  const fetchBugDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const bugData = await api.getBugDetails(id);
      setBug(bugData);

      const commentsData = await api.getComments(id);
      setComments(commentsData);

      // Fetch developers/testers if user is Administrator (to populate dropdown)
      if (user?.role === 'Administrator') {
        const allUsers = await api.getUsers();
        setDevelopers(allUsers.filter(u => u.role === 'Developer' || u.role === 'Tester'));
      }

      // Fetch audit history
      try {
        const logsData = await api.getBugAudits(id);
        setAuditLogs(logsData);
      } catch (logErr) {
        console.error('Failed to retrieve bug audits:', logErr);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve bug details or comments.');
      showToast('Failed to retrieve bug details or comments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdatedLogs = async () => {
    try {
      const logsData = await api.getBugAudits(id);
      setAuditLogs(logsData);
    } catch (logErr) {
      console.error('Failed to retrieve bug audits:', logErr);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchBugDetails();
    }
  }, [id, user]);

  const handlePostComment = async (e) => {
    e.preventDefault();

    // Custom validation
    const newErrors = {};
    if (!newComment.trim()) {
      newErrors.comment = "Please write a comment before posting.";
    }

    if (Object.keys(newErrors).length > 0) {
      setCommentErrors(newErrors);
      return;
    }

    setCommentSubmitting(true);
    setError('');

    try {
      await api.addComment(id, newComment);
      setNewComment('');
      setCommentErrors({});
      showToast('Comment posted successfully.', 'success');
      const commentsData = await api.getComments(id);
      setComments(commentsData);
      await fetchUpdatedLogs();
    } catch (err) {
      console.error(err);
      setError('Failed to post comment.');
      showToast('Failed to post comment.', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleEditComment = (commentId, originalText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(originalText);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      showToast('Comment text cannot be empty.', 'error');
      return;
    }

    setUpdating(true);
    setError('');
    try {
      await api.editComment(commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText('');
      showToast('Comment updated successfully.', 'success');
      const commentsData = await api.getComments(id);
      setComments(commentsData);
    } catch (err) {
      console.error(err);
      setError('Failed to edit comment.');
      showToast('Failed to edit comment.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setUpdating(true);
    setError('');
    try {
      await api.deleteComment(commentId);
      showToast('Comment deleted successfully.', 'success');
      const commentsData = await api.getComments(id);
      setComments(commentsData);
      await fetchUpdatedLogs();
    } catch (err) {
      console.error(err);
      setError('Failed to delete comment.');
      showToast('Failed to delete comment.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setError('');
    try {
      await api.updateBug(id, { status: newStatus });
      showToast(`Bug status updated to ${newStatus}.`, 'success');
      await fetchBugDetails(); // Refresh all details
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update bug status.');
      showToast(err.message || 'Failed to update bug status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    setUpdating(true);
    setError('');
    try {
      await api.updateBug(id, { assigned_user: newAssigneeId ? parseInt(newAssigneeId) : null });
      showToast('Bug assignee updated.', 'success');
      await fetchBugDetails();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update bug assignee.');
      showToast(err.message || 'Failed to update bug assignee.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleClaimBug = async () => {
    setUpdating(true);
    setError('');
    try {
      await api.updateBug(id, { assigned_user: user.user_id });
      showToast('Bug ticket successfully claimed.', 'success');
      await fetchBugDetails();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to claim bug.');
      showToast(err.message || 'Failed to claim bug.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBug = async () => {
    setUpdating(true);
    setError('');
    try {
      await api.deleteBug(id);
      showToast('Bug ticket soft-deleted.', 'success');
      router.push('/dashboard/bugs');
    } catch (err) {
      console.error(err);
      setError('Failed to delete bug ticket.');
      showToast('Failed to delete bug ticket.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRestoreBug = async () => {
    setUpdating(true);
    setError('');
    try {
      await api.restoreBug(id);
      showToast('Bug ticket successfully restored.', 'success');
      await fetchBugDetails();
    } catch (err) {
      console.error(err);
      setError('Failed to restore bug ticket.');
      showToast('Failed to restore bug ticket.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handlePurgeBug = async () => {
    setUpdating(true);
    setError('');
    try {
      await api.permanentlyDeleteBug(id);
      showToast('Bug ticket permanently purged.', 'success');
      router.push('/dashboard/bugs');
    } catch (err) {
      console.error(err);
      setError('Failed to permanently purge bug ticket.');
      showToast('Failed to permanently purge bug ticket.', 'error');
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin"></div>
          <span className="text-subtitle text-xs mt-3">Loading bug workspace...</span>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="text-center p-12 bg-card-bg border border-card-border rounded-2xl">
        <h3 className="text-lg font-bold text-title">Bug Report Not Found</h3>
        <p className="text-subtitle text-sm mt-2">The requested defect log does not exist or has been removed.</p>
        <Link href="/dashboard/bugs" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
          &larr; Back to Directory
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'Administrator';
  const isDeveloper = user?.role === 'Developer';
  const isTester = user?.role === 'Tester';
  const isAssignedToMe = bug.assigned_user === user?.user_id;

  const isAbandoned = bug.status === 'Archived' || !bug.project || !!bug.project.deleted_at;

  const canUpdateStatus = !bug.deleted_at && !isAbandoned && (
    bug.trackable_by_all ||
    (bug.assigned_user && (isAdmin || isAssignedToMe))
  );

  // Status List in correct lifecycle order
  const statuses = ['Open', 'Assigned', 'In Progress', 'Testing', 'Resolved', 'Closed'];

  // Badge styles
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'Assigned': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'In Progress': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case 'Testing': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Closed': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      case 'Archived': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
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
      case 'Archived': return 'text-rose-400';
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
      case 'Archived': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-card-border font-sans">
        <Link href="/dashboard/bugs" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </Link>
        <span className="text-[10px] font-bold text-indigo-400 tracking-wider bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10 font-mono">
          TICKET: BUG-{bug.bug_id}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

        {/* LEFT COLUMN: Bug Technical Details and Comments Feed */}
        <div className="lg:col-span-2 space-y-6">

          {/* Technical Info Block */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <span className="text-xs text-subtitle font-medium uppercase tracking-wider font-sans flex items-center flex-wrap gap-1.5">
                {bug.project?.project_name || 'Project Scope'}
                {isAbandoned && (
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-sans uppercase">
                    Abandoned Project
                  </span>
                )}
              </span>
              <h1 className="text-2xl font-bold text-title mt-1 leading-tight font-sans">
                {bug.title}
              </h1>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-label font-sans">
                Incident Description
              </h3>
              <div className="bg-input-bg border border-input-border rounded-xl p-4 md:p-5 text-sm text-page-fg leading-relaxed font-sans whitespace-pre-wrap">
                {bug.description}
              </div>
            </div>

            {/* Micro badges for small viewport info */}
            <div className="flex flex-wrap gap-4 text-xs text-subtitle pt-2 font-sans">
              <div>
                Reported by <strong className="text-title">{bug.reporter?.name}</strong>
              </div>
              <div className="w-1.5 h-1.5 bg-card-border rounded-full align-middle self-center hidden sm:block"></div>
              <div>
                Created on <strong className="text-title">{new Date(bug.created_at).toLocaleString()}</strong>
              </div>
              <div className="w-1.5 h-1.5 bg-card-border rounded-full align-middle self-center hidden sm:block"></div>
              <div>
                Updated on <strong className="text-title">{new Date(bug.updated_at).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Collaborative Timeline / Comments Feed */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-title font-sans flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Collaborative Discussion
            </h2>

            {/* Message timelines list */}
            {comments.length === 0 ? (
              <div className="text-center p-8 bg-input-bg/30 border border-card-border rounded-xl text-subtitle text-xs font-sans">
                No discussion entries yet. Write a message below to coordinate fixes.
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {comments.map((comm) => {
                  const authorRole = comm.user?.role;
                  let roleBadgeStyle = 'bg-slate-500/10 text-slate-400 border border-slate-500/10';
                  if (authorRole === 'Administrator') roleBadgeStyle = 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
                  else if (authorRole === 'Developer') roleBadgeStyle = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
                  else if (authorRole === 'Tester') roleBadgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

                  return (
                    <div key={comm.comment_id} className="bg-input-bg/40 border border-card-border/60 rounded-xl p-4 space-y-2 relative group/comment">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm text-title">{comm.user?.name}</strong>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${roleBadgeStyle}`}>
                            {authorRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-subtitle font-sans">
                            {new Date(comm.created_at).toLocaleString()}
                          </span>

                          {/* Edit comment button if creator */}
                          {comm.user_id === user?.user_id && editingCommentId !== comm.comment_id && !isAbandoned && (
                            <button
                              onClick={() => handleEditComment(comm.comment_id, comm.message)}
                              className="text-slate-500 hover:text-indigo-400 p-1 rounded hover:bg-indigo-500/10 transition-colors opacity-0 group-hover/comment:opacity-100 cursor-pointer"
                              title="Edit comment"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {/* Delete comment button (Admin or creator) */}
                          {(isAdmin || comm.user_id === user?.user_id) && !isAbandoned && (
                            <button
                              onClick={() => {
                                triggerConfirmation(
                                  'Delete Comment',
                                  'Are you sure you want to delete this discussion entry? This action cannot be undone.',
                                  () => handleDeleteComment(comm.comment_id),
                                  'Delete',
                                  true
                                );
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors opacity-0 group-hover/comment:opacity-100 cursor-pointer"
                              title="Delete comment"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {editingCommentId === comm.comment_id ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            rows={2}
                            className="w-full bg-input-bg border border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-page-fg focus:outline-none focus:ring-1 focus:ring-indigo-500/20 font-sans resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-title border border-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditComment(comm.comment_id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-page-fg text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {comm.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Post comment block */}
            {bug.deleted_at ? (
              <div className="p-4 bg-slate-800/30 border border-card-border rounded-xl text-center text-subtitle text-xs font-sans">
                This ticket is in the recycle bin. Discussion and updates have been locked.
              </div>
            ) : isAbandoned ? (
              <div className="p-4 bg-slate-800/30 border border-card-border rounded-xl text-center text-subtitle text-xs font-sans">
                This ticket belongs to an abandoned or deleted project. Discussion and updates have been locked.
              </div>
            ) : bug.status === 'Closed' ? (
              <div className="p-4 bg-slate-800/30 border border-card-border rounded-xl text-center text-subtitle text-xs font-sans">
                This ticket is closed. Discussion and updates have been locked.
              </div>
            ) : (
              <form onSubmit={handlePostComment} noValidate className="space-y-3 pt-2">
                <label className=" text-xs font-bold uppercase tracking-wider text-label font-sans flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Add Progress Update / Comment
                </label>
                <textarea
                  placeholder="Describe your fix progress, verify a resolution, or ask for clarifications..."
                  rows={3}
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    setCommentErrors(prev => ({ ...prev, comment: '' }));
                  }}
                  className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-sm text-page-fg placeholder-slate-500 focus:outline-none transition-all resize-none font-sans ${commentErrors.comment
                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-input-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                />
                {commentErrors.comment && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-sans">
                    ⚠️ {commentErrors.comment}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all duration-300 shadow-md shadow-indigo-500/10 cursor-pointer font-sans"
                  >
                    {commentSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Ticket Audit Timeline */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-title font-sans flex items-center gap-3.5">
              <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ticket Audit History
            </h2>

            {auditLogs.length === 0 ? (
              <div className="text-center p-8 bg-input-bg/30 border border-card-border rounded-xl text-subtitle text-xs font-sans">
                No activity logs registered for this ticket yet.
              </div>
            ) : (
              <div className="relative border-l-2 border-indigo-500/20 ml-3.5 pl-6 space-y-6">
                {auditLogs.map((log) => {
                  // Icon decider
                  let icon = (
                    <span className="absolute left-[-34px] top-1.5 w-5 h-5 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center text-[10px] text-indigo-400 font-sans">
                      •
                    </span>
                  );
                  if (log.action_type === 'BUG_CREATED') {
                    icon = (
                      <span className="absolute left-[-36px] top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                    );
                  } else if (log.action_type === 'STATUS_CHANGED') {
                    icon = (
                      <span className="absolute left-[-36px] top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
                        </svg>
                      </span>
                    );
                  } else if (log.action_type === 'TICKET_ASSIGNED') {
                    icon = (
                      <span className="absolute left-[-36px] top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-sky-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                    );
                  } else if (log.action_type === 'COMMENT_ADDED') {
                    icon = (
                      <span className="absolute left-[-36px] top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-violet-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </span>
                    );
                  } else if (log.action_type === 'COMMENT_DELETED') {
                    icon = (
                      <span className="absolute left-[-36px] top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-rose-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </span>
                    );
                  } else if (log.action_type === 'TICKET_DELETED' || log.action_type === 'TICKET_PURGED') {
                    icon = (
                      <span className="absolute left-[-36px] top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-rose-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </span>
                    );
                  }

                  // Message decider
                  let detailMsg = '';
                  try {
                    const data = JSON.parse(log.details);
                    if (log.action_type === 'BUG_CREATED') {
                      detailMsg = `reported defect ticket "${data.title}"`;
                    } else if (log.action_type === 'STATUS_CHANGED') {
                      detailMsg = `changed status from "${data.old_status}" to "${data.new_status}"`;
                    } else if (log.action_type === 'TICKET_ASSIGNED') {
                      detailMsg = `assigned this ticket from "${data.old_assignee}" to "${data.new_assignee}"`;
                    } else if (log.action_type === 'COMMENT_ADDED') {
                      detailMsg = `posted progress comment: "${data.comment_message}"`;
                    } else if (log.action_type === 'COMMENT_DELETED') {
                      detailMsg = `deleted comment of ${data.author_name || 'user'}: "${data.comment_message}"`;
                    } else if (log.action_type === 'TICKET_DELETED') {
                      detailMsg = `moved ticket to recycle bin`;
                    } else if (log.action_type === 'TICKET_RESTORED') {
                      detailMsg = `restored ticket to active directory`;
                    }
                  } catch (e) {
                    detailMsg = log.details;
                  }

                  return (
                    <div key={log.log_id} className="relative pl-4 font-sans">
                      {icon}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-subtitle">
                          <strong className="text-title font-semibold">{log.user?.name || 'Someone'}</strong>{' '}
                          <span className="text-slate-400">{detailMsg}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket Settings, Assignment, Status Transitions */}
        <div className="space-y-6">

          {/* Parameters Settings Card */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-title font-sans">
              Ticket Parameters
            </h2>

            {/* Severity & Priority Row */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-card-border/60 font-sans">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-label mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Severity
                </span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(bug.severity)}`}>
                  {bug.severity}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-label mb-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Priority
                </span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(bug.priority)}`}>
                  {bug.priority}
                </span>
              </div>
            </div>

            {/* Lifecycle Status Transitions */}
            <div className="space-y-3">
              <label className=" text-[10px] font-bold uppercase tracking-wider text-label font-sans flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lifecycle Status
              </label>

              {/* If user has authorization to update status */}
              {canUpdateStatus ? (
                <div className="relative font-sans">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-3.5 py-2.5 text-sm text-page-fg focus:outline-none focus:border-indigo-500 transition-all flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(bug.status)}`}></span>
                      <span className={getStatusTextColor(bug.status)}>{bug.status}</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {statusDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)}></div>
                      <div className="absolute right-0 left-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden animate-fadeIn">
                        {statuses.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              handleStatusChange(s);
                              setStatusDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-input-bg/60 transition-colors flex items-center gap-2"
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(s)}`}></span>
                            <span className={getStatusTextColor(s)}>{s}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center font-sans">
                  <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider ${getStatusStyle(bug.status)}`}>
                    {bug.status}
                  </span>
                  {!bug.assigned_user && !bug.trackable_by_all && !isAbandoned && (
                    <span className="text-[10px] text-amber-500/80 italic ml-2 flex items-center gap-1">
                      {isAdmin ? '⚠️ Assign member to enable status updates' : 'Waiting for Administrator to assign ticket...'}
                    </span>
                  )}
                  {isDeveloper && !isAssignedToMe && bug.assigned_user && bug.status !== 'Closed' && !isAbandoned && (
                    <span className="text-[10px] text-subtitle italic ml-2">Claim to update</span>
                  )}
                </div>
              )}
            </div>

            {/* Developer Assignment Block */}
            <div className="space-y-3 pt-2 border-b border-card-border/60 pb-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-label font-sans flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Assignee
              </label>

              {(isAdmin && !bug.deleted_at && !isAbandoned) ? (
                <div className="relative font-sans">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-3.5 py-2.5 text-sm text-page-fg focus:outline-none focus:border-indigo-500 transition-all flex items-center justify-between font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {bug.assigned_user ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                          <span className="text-title text-sm">{bug.assignee?.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
                          <span className="text-amber-500/70 italic text-sm">Unassigned</span>
                        </>
                      )}
                    </span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {assigneeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAssigneeDropdownOpen(false)}></div>
                      <div className="absolute right-0 left-0 mt-2 bg-card-bg border border-card-border rounded-xl shadow-xl z-20 py-1.5 max-h-48 overflow-y-auto animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            handleAssigneeChange(null);
                            setAssigneeDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-input-bg/60 transition-colors flex items-center gap-2 text-amber-500/70 font-semibold"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
                          Unassigned
                        </button>
                        {developers.map((d) => (
                          <button
                            key={d.user_id}
                            type="button"
                            onClick={() => {
                              handleAssigneeChange(d.user_id);
                              setAssigneeDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-input-bg/60 transition-colors flex items-center gap-2 text-sky-400 font-semibold"
                          >
                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                            {d.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (isDeveloper && !bug.deleted_at && !isAbandoned) ? (
                // Developer / Tester claim options, but blocked if Closed
                <div className="font-sans">
                  {bug.status === 'Closed' ? (
                    <div className="bg-input-bg border border-input-border rounded-xl px-3 py-2.5 text-sm text-page-fg">
                      {bug.assignee?.name || <span className="text-amber-500/70 italic">Unassigned</span>}
                    </div>
                  ) : bug.assigned_user ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-input-bg border border-input-border rounded-xl px-3 py-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        <span className="text-sm font-semibold text-title">{bug.assignee?.name}</span>
                      </div>
                      {isAssignedToMe && (
                        <button
                          onClick={() => handleAssigneeChange(null)}
                          disabled={updating}
                          className="text-left text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer w-fit"
                        >
                          &times; Release Claim
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleClaimBug}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Claim Ticket
                    </button>
                  )}
                </div>
              ) : (
                // Guest view is read-only
                <div className="bg-input-bg border border-input-border rounded-xl px-3 py-2.5 text-sm text-page-fg font-sans">
                  {bug.assignee?.name || <span className="text-amber-500/70 italic">Unassigned</span>}
                </div>
              )}
            </div>

            {/* Public Tracking Switch */}
            {isAdmin && !bug.deleted_at && !isAbandoned && (
              <div className="pt-4 border-t border-card-border/60 flex items-center justify-between font-sans">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-label">Public Tracking</span>
                  <span className="text-[10px] text-subtitle">Allow all roles to track & change status</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setUpdating(true);
                    setError('');
                    try {
                      await api.updateBug(id, { trackable_by_all: !bug.trackable_by_all });
                      await fetchBugDetails();
                    } catch (err) {
                      console.error(err);
                      setError('Failed to update tracking permissions.');
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bug.trackable_by_all ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${bug.trackable_by_all ? 'translate-x-4' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            )}

            {!isAdmin && bug.trackable_by_all && !isAbandoned && (
              <div className="pt-4 border-t border-card-border/60 flex items-center gap-1.5 text-[10px] text-indigo-400 font-semibold font-sans">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Open for public tracking (all roles)
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin && !isAbandoned && (
              <div className="space-y-3 pt-2">
                {bug.deleted_at ? (
                  <>
                    {/* Restore Bug Action */}
                    <button
                      onClick={() => {
                        triggerConfirmation(
                          'Restore Bug Ticket',
                          `Are you sure you want to restore BUG-${bug.bug_id}: "${bug.title}" back to active directory?`,
                          handleRestoreBug,
                          'Restore Ticket',
                          false
                        );
                      }}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-400 shadow-lg shadow-indigo-500/10 cursor-pointer font-sans"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.89M9 11l3-3 3 3m-3-3v12" />
                      </svg>
                      Restore Ticket
                    </button>

                    {/* Permanent/Purge Delete Bug Action */}
                    <button
                      onClick={() => {
                        triggerConfirmation(
                          'Permanently Purge Ticket',
                          `Are you sure you want to permanently delete and purge BUG-${bug.bug_id}: "${bug.title}"? This action is destructive and cannot be undone.`,
                          handlePurgeBug,
                          'Purge Ticket',
                          true
                        );
                      }}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer font-sans shadow-lg shadow-rose-500/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Purge Ticket (Permanent)
                    </button>
                  </>
                ) : (
                  <>
                    {/* Clear Bug Action */}
                    {bug.status === 'Resolved' && (
                      <button
                        onClick={() => {
                          triggerConfirmation(
                            'Clear & Close Bug',
                            `Confirm that BUG-${bug.bug_id} is completed and verified. This will clear the bug and move it to the Recent Bugs directory.`,
                            () => handleStatusChange('Closed'),
                            'Clear & Close',
                            false
                          );
                        }}
                        disabled={updating}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-400 shadow-lg shadow-emerald-500/10 cursor-pointer font-sans"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Clear & Verify Bug
                      </button>
                    )}

                    {/* Soft Delete Bug Action */}
                    <button
                      onClick={() => {
                        triggerConfirmation(
                          'Move Ticket to Recycle Bin',
                          `Are you sure you want to soft-delete BUG-${bug.bug_id}: "${bug.title}"? This ticket will move to the Admins Recycle Bin.`,
                          handleDeleteBug,
                          'Delete Ticket',
                          true
                        );
                      }}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer font-sans"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Ticket
                    </button>
                  </>
                )}
              </div>
            )}

          </div>

          {/* Details on Reporter */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4 text-xs text-subtitle font-sans">
            <h3 className="font-bold text-title uppercase tracking-wider text-[10px] flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Audit Metadata
            </h3>
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Reporter:
                </span>
                <strong className="text-title">{bug.reporter?.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email:
                </span>
                <span className="text-title select-all truncate max-w-[150px]" title={bug.reporter?.email}>{bug.reporter?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Created:
                </span>
                <span className="text-title">{new Date(bug.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last Activity:
                </span>
                <span className="text-title">{new Date(bug.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Dialog (Modal) */}
      {
        showConfirmModal && (
          <div
            onClick={() => {
              setShowConfirmModal(false);
              setConfirmAction(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sans cursor-pointer"
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
        )
      }
    </div >
  );
}
