import axiosClient from "./axiosClient";

// Product and order API for consumers
export const consumerApi = {
  async getSuppliers() {
    const response = await axiosClient.get("suppliers/");
    return response.data;
  },

  async sendLinkRequest(supplierId) {
    const response = await axiosClient.post("suppliers/links/create/", {
      supplier: supplierId,
    });
    return response.data;
  },

  async getProducts() {
    const res = await axiosClient.get("/products/");
    return res.data;
  },

  async getOrders() {
    const res = await axiosClient.get("/orders/");
    return res.data;
  },

  async createOrder(productId, quantity = 1) {
    return axiosClient.post("/orders/", { product: productId, quantity });
  },
};
