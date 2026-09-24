import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'eventflow_token';

export const tokenStorage = {
  get: () => window.localStorage.getItem(TOKEN_KEY),
  set: (token) => window.localStorage.setItem(TOKEN_KEY, token),
  clear: () => window.localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthenticationAttempt = ['/auth/login', '/auth/signup'].includes(error.config?.url);
    if (error.response?.status === 401 && !isAuthenticationAttempt) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('eventflow:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') {
    return 'Unable to reach the EventFlow server. Check your connection and try again.';
  }
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  return fallback;
}

export function getApiDetails(error) {
  return error?.response?.data?.details || [];
}

export default api;
