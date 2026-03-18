import axios from 'axios';

const api = axios.create({
  baseURL: 'https://7vkudcjvq9.execute-api.ap-south-1.amazonaws.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle session invalidation — auto-logout if admin session was killed remotely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'SESSION_INVALIDATED'
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Full page redirect to clear all React state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
