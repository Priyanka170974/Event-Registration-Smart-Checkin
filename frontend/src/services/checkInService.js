import api from './api';

export const checkInService = {
  verify: (payload) => api.post('/checkin/verify', payload).then((response) => response.data),
  scan: (payload) => api.post('/checkin/scan', payload).then((response) => response.data),
};
