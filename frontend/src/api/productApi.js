import axiosClient from "./axiosClient";

export const productApi = {
  // Get products based on roles
  getAll: async () => {
    const response = await axiosClient.get("/products/");
    return response.data;
  },

  // Get a product
  getById: async (id) => {
    const response = await axiosClient.get(`/products/${id}/`);
    return response.data;
  },

  // Create a new product
  create: async (data) => {
    const response = await axiosClient.post("/products/", data);
    return response.data;
  },

  // Update the product
  update: async (id, data) => {
    const response = await axiosClient.patch(`/products/${id}/`, data);
    return response.data;
  },

  // Delete the product
  delete: async (id) => {
    const response = await axiosClient.delete(`/products/${id}/`);
    return response.data;
  },

  async update(id, data) {
    const res = await axiosClient.patch(`/products/${id}/`, data);
    return res.data;
  },
};

// export default productApi;
