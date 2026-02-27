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

export default api;
