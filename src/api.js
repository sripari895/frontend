import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  baseURL: 'https://backend-2-xiu9.onrender.com/api', // Render Production API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('swiftship_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Token error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: handle global errors here
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
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