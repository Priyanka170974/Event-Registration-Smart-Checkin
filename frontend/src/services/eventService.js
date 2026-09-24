import api from './api';

export const eventService = {
  list: (params = {}) => api.get('/events', { params }).then((response) => response.data),
  listManaged: (params = {}) => api.get('/events/manage', { params }).then((response) => response.data),
  get: (id) => api.get(`/events/${id}`).then((response) => response.data),
  create: (payload) => api.post('/events', payload).then((response) => response.data),
  update: (id, payload) => api.put(`/events/${id}`, payload).then((response) => response.data),
  remove: (id) => api.delete(`/events/${id}`).then((response) => response.data),
  registrations: (id, params = {}) =>
    api.get(`/events/${id}/registrations`, { params }).then((response) => response.data),
};
