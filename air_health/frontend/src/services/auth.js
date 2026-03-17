import { get, post, setToken, clearToken } from './api';

export async function login({ username, password }) {
  const data = await post('/users/login/', { username, password });
  setToken(data.access);
  return data;
}

export async function register({ username, email, password, first_name, last_name, role }) {
  const data = await post('/users/register/', {
    username,
    email,
    password,
    first_name,
    last_name,
    role,
  });
  return data;
}

export async function getCurrentUser() {
  return get('/users/me/');
}

export function logout() {
  clearToken();
}
