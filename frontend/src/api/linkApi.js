import axiosClient from "./axiosClient";

export const linkApi = {
  async getAll() {
    const response = await axiosClient.get("suppliers/links/");
    return response.data;
  },

  async update(id, status) {
    const response = await axiosClient.patch(`suppliers/links/${id}/update/`, { status });
    return response.data;
  },
};
