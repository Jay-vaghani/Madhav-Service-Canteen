import api from "./api";

export const orderService = {
  /**
   * Create a Razorpay order on the backend.
   * Backend calculates the total from DB prices (never trusts frontend amounts).
   */
  createOrder: async (items) => {
    const response = await api.post("/orders/create", { items });
    return response.data;
  },

  /**
   * Verify payment signature on the backend after Razorpay checkout success.
   */
  verifyPayment: async (paymentData) => {
    const response = await api.post("/orders/verify", paymentData);
    return response.data;
  },

  /**
   * Poll order status (fallback if webhook/verify hasn't updated yet).
   */
  getOrderStatus: async (razorpayOrderId) => {
    const response = await api.get(`/orders/status/${razorpayOrderId}`);
    return response.data;
  },

  // ── Order Management (Admin/Manager) ──

  /**
   * Get paid orders for management dashboard.
   * @param {"pending"|"delivered"|"all"} status - Filter by delivery status
   */
  getPaidOrders: async (status = "all") => {
    const response = await api.get(`/orders/manage?status=${status}`);
    return response.data;
  },

  /**
   * Mark an order as delivered.
   * @param {string} orderId - MongoDB _id of the order
   */
  markDelivered: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/deliver`);
    return response.data;
  },

  // ── Customer Order History ──

  /**
   * Get the logged-in customer's order history.
   */
  getCustomerOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },
};
