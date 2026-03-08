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

  // ── Server-side Search (Admin/Manager) ──

  /**
   * Search orders on the backend — handles scale (thousands of orders).
   * @param {object} params
   * @param {string} [params.orderNum]  - Sequence suffix after last dash (e.g. "12")
   * @param {string} [params.customer] - Partial name or phone number
   * @param {string} [params.status]   - "pending" | "delivered" | "all"
   */
  searchOrders: async ({ orderNum = "", customer = "", status = "all" } = {}) => {
    const qs = new URLSearchParams();
    if (orderNum.trim()) qs.set("orderNum", orderNum.trim());
    if (customer.trim()) qs.set("customer", customer.trim());
    qs.set("status", status);
    const response = await api.get(`/orders/search?${qs.toString()}`);
    return response.data;
  },
};

