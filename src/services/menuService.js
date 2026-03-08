import api from './api';

export const menuService = {
  // Get all menu items
  getAllMenuItems: async () => {
    const response = await api.get('/menu/items');
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/menu/categories');
    return response.data;
  },

  // Create menu item
  createMenuItem: async (data) => {
    const response = await api.post('/menu/items', data);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (id, data) => {
    const response = await api.put(`/menu/items/${id}`, data);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu/items/${id}`);
    return response.data;
  },

  // Update availability
  updateAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/menu/items/${id}/availability`, { isAvailable });
    return response.data;
  },

  // Bulk availability update — single request, one DB call
  // Pass ids[] to target specific items, omit to update ALL items
  bulkUpdateAvailability: async (isAvailable, ids) => {
    const body = { isAvailable };
    if (Array.isArray(ids) && ids.length > 0) body.ids = ids;
    const response = await api.patch('/menu/items/bulk-availability', body);
    return response.data; // { message, modifiedCount }
  },
};
