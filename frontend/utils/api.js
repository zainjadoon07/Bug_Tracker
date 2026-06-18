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
  register: (name, email, password, role) => 
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    }),
    
  login: (email, password) => 
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
};
