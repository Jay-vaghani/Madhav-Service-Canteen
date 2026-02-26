import api from './api';

export const userService = {
  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Create manager
  createManager: async (data) => {
    const response = await api.post('/users/managers', data);
    return response.data;
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Promote to admin
  promoteToAdmin: async (id) => {
    const response = await api.patch(`/users/${id}/promote`);
    return response.data;
  },
};
