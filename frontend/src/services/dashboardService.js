import api from './api';

export const dashboardService = {
  stats: () => api.get('/dashboard/overview').then((response) => response.data),
};
