import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  baseURL: 'https://backend-2-xiu9.onrender.com/api', // Backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — token is set globally by AuthContext via
// api.defaults.headers.common['Authorization'], so no need to read
// localStorage on every request.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor to handle common API errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// ==================== SUPPORT API ====================
export const submitSupportTicket = (data) => api.post('/support', data);

export const getMySupportTickets = () => api.get('/support/my');

export const getAllSupportTickets = () => api.get('/support/all');

export const updateSupportTicketStatus = (id, status) =>
  api.patch(`/support/${id}/status`, { status });

export const replyToSupportTicket = (id, message) =>
  api.post(`/support/${id}/reply`, { message });

// Export the configured API instance
export default api;
