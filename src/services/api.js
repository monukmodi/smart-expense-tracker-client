import axios from 'axios';
import { getToken, clearAuth } from '../utils/storage.js';

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // Token invalid/expired – clear and let UI redirect in future steps
      clearAuth();
    }
    const message = err?.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
