import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Shared axios instance for all API calls.
 * Configured with base URL and automatic credential/auth header handling.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Request interceptor
 * Automatically attaches the JWT 'Bearer' token from localStorage to every outgoing request.
 */
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

/**
 * Response interceptor
 * Centralized error handler. If any request returns 401 (Unauthorized),
 * it clears the local auth state and redirects correctly to the login page.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, invalid, or user logged out elsewhere
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Task-related API endpoints
export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getActivityLogs: (params) => api.get('/tasks/activity', { params }),
};

// User and Auth specific API endpoints
export const userAPI = {
  getUsers: () => api.get('/auth/users'),
};

export default api;
