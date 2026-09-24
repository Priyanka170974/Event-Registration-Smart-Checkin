import api from './api';

export const registrationService = {
  create: (payload) => api.post('/registrations', payload).then((response) => response.data),
  list: (params = {}) => api.get('/registrations', { params }).then((response) => response.data),
  ticket: (ticketId) => api.get(`/registrations/ticket/${encodeURIComponent(ticketId)}`).then((response) => response.data),
};
