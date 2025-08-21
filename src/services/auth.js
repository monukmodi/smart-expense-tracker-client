import api from './api.js';
import { setToken, setUser, clearAuth } from '../utils/storage.js';

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/api/auth/register', { name, email, password });
  // data: { user, token }
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export function logoutUser() {
  clearAuth();
}
