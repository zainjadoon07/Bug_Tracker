const BASE_URL = 'http://localhost:5000/api';

const apiFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

export const api = {
  // Auth
  register: (name, email, password, role) => 
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    }),
    
  login: (email, password) => 
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getUsers: () => 
    apiFetch('/auth/users', { method: 'GET' }),

  // Dashboard Stats
  getDashboardStats: () => 
    apiFetch('/dashboard/stats', { method: 'GET' }),

  // Projects
  getProjects: (deleted = false) => 
    apiFetch(deleted ? '/projects?deleted=true' : '/projects', { method: 'GET' }),

  createProject: (project_name, description) => 
    apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify({ project_name, description })
    }),

  updateProject: (id, project_name, description) =>
    apiFetch(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ project_name, description })
    }),

  deleteProject: (id) =>
    apiFetch(`/projects/${id}`, { method: 'DELETE' }),

  restoreProject: (id) =>
    apiFetch(`/projects/${id}/restore`, { method: 'PUT' }),

  permanentlyDeleteProject: (id) =>
    apiFetch(`/projects/${id}/permanent`, { method: 'DELETE' }),

  // Bugs
  getBugs: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/bugs?${queryParams}` : '/bugs';
    return apiFetch(url, { method: 'GET' });
  },

  getBugDetails: (id) => 
    apiFetch(`/bugs/${id}`, { method: 'GET' }),

  createBug: (bugData) => 
    apiFetch('/bugs', {
      method: 'POST',
      body: JSON.stringify(bugData)
    }),

  updateBug: (id, updateData) => 
    apiFetch(`/bugs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }),

  deleteBug: (id) =>
    apiFetch(`/bugs/${id}`, { method: 'DELETE' }),

  restoreBug: (id) =>
    apiFetch(`/bugs/${id}/restore`, { method: 'PUT' }),

  permanentlyDeleteBug: (id) =>
    apiFetch(`/bugs/${id}/permanent`, { method: 'DELETE' }),

  // Comments
  getComments: (bugId) => 
    apiFetch(`/comments/${bugId}`, { method: 'GET' }),

  addComment: (bugId, message) => 
    apiFetch(`/comments/${bugId}`, {
      method: 'POST',
      body: JSON.stringify({ message })
    }),

  deleteComment: (commentId) =>
    apiFetch(`/comments/${commentId}`, { method: 'DELETE' }),

  editComment: (commentId, message) =>
    apiFetch(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ message })
    }),

  getBugAudits: (bugId) =>
    apiFetch(`/audits/bug/${bugId}`, { method: 'GET' }),

  getRecentAudits: () =>
    apiFetch('/audits/recent', { method: 'GET' })
};
