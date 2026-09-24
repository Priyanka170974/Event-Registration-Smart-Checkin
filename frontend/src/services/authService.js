import api from './api';

export const authService = {
  signup: (payload) => api.post('/auth/signup', payload).then((response) => response.data),
  login: (payload) => api.post('/auth/login', payload).then((response) => response.data),
  me: () => api.get('/auth/me').then((response) => response.data),
  logout: () => api.post('/auth/logout').then((response) => response.data),
};
