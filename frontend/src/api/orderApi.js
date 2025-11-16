import axiosClient from "./axiosClient";

export const orderApi = {
  // Get all orders
  async getAll() {
    try {
      const response = await axiosClient.get("/orders/");
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update order status
  async updateStatus(id, status) {
    try {
      const response = await axiosClient.patch(`orders/${id}/status/`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error.response?.data || error.message);
      throw error;
    }
  },
};
