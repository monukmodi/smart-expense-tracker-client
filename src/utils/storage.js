// Simple localStorage-based auth storage utilities
const TOKEN_KEY = 'set_token';
const USER_KEY = 'set_user';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export function clearAuth() {
  clearToken();
  clearUser();
}
