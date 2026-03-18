import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Customer Login
  customerLogin: async (phone) => {
    const response = await api.post('/customer-auth/login', { phone });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Customer Register
  customerRegister: async (name, email, phone) => {
    const response = await api.post('/customer-auth/register', { name, email, phone });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout — notify backend to free device slot (admin), then clear local storage
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore — token may already be expired
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Verify token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};
