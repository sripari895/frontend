import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Use port 5001 to avoid conflict
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle common API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global 401s here if needed
    return Promise.reject(error);
  }
);

// ==================== SUPPORT API ====================
export const submitSupportTicket = (data) => api.post('/support', data);
export const getMySupportTickets = () => api.get('/support/my');
export const getAllSupportTickets = () => api.get('/support/all');
export const updateSupportTicketStatus = (id, status) => api.patch(`/support/${id}/status`, { status });
export const replyToSupportTicket = (id, message) => api.post(`/support/${id}/reply`, { message });

export default api;
