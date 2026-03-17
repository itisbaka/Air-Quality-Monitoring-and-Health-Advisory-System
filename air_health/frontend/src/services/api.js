const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(payload?.detail || res.statusText || 'API request failed');
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function post(path, body, options = {}) {
  return request(path, { method: 'POST', body: JSON.stringify(body), ...options });
}

export function get(path, options = {}) {
  return request(path, { method: 'GET', ...options });
}

export function put(path, body, options = {}) {
  return request(path, { method: 'PUT', body: JSON.stringify(body), ...options });
}

export function del(path, options = {}) {
  return request(path, { method: 'DELETE', ...options });
}

export function setToken(accessToken) {
  localStorage.setItem('access_token', accessToken);
}

export function clearToken() {
  localStorage.removeItem('access_token');
}

export function getToken() {
  return localStorage.getItem('access_token');
}
