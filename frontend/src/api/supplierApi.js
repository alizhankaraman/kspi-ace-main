import axiosClient from "./axiosClient";

export const supplierApi = {
  async getMySupplier() {
    const res = await axiosClient.get("/suppliers/me/");
    const data = res.data;
    if (Array.isArray(data)) return data[0];
    if (data?.results) return data.results[0];
    return data;
  },
  async getEmployees(supplierId) {
    if(!supplierId) throw new Error("supplierId is required");
    const res = await axiosClient.get(`/suppliers/${supplierId}/employees/`);
    return res.data.employees;
  },
  async toggleEmployee(supplierId, employeeId) {
    const res = await axiosClient.patch(
      `suppliers/${supplierId}/employees/${employeeId}/toggle/`
    );
    return res.data;
  },
  async deleteEmployee(supplierId, employeeId) {
    const res = await axiosClient.delete(
      `suppliers/${supplierId}/employees/${employeeId}/delete/`
    );
    return res.data;
  },
};
