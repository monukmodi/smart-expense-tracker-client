import api from './api.js';
import { setToken, setUser, clearAuth } from '../utils/storage.js';

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/api/auth/register', { name, email, password });
  // server returns: { message }
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

export async function verifyEmail({ email, code }) {
  const { data } = await api.post('/api/auth/verify', { email, code });
  // data: { user, token }
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function resendVerificationCode({ email }) {
  const { data } = await api.post('/api/auth/resend-code', { email });
  // data: { message }
  return data;
}

export async function googleLogin({ idToken }) {
  const { data } = await api.post('/api/auth/google', { idToken });
  // data: { user, token }
  setToken(data.token);
  setUser(data.user);
  return data;
}
