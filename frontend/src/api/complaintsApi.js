import axiosInstance from "./axiosClient";

export const getComplaintsSales = () =>
  axiosInstance.get("/complaints/sales/list/");

export const getComplaintsEscalated = () =>
  axiosInstance.get("/complaints/manager/escalated/");

export const resolveComplaint = (id) =>
  axiosInstance.post(`/complaints/sales/resolve/${id}/`);

export const escalateComplaint = (id) =>
  axiosInstance.post(`/complaints/sales/escalate/${id}/`);

export const closeComplaint = (id) =>
  axiosInstance.post(`/complaints/manager/close/${id}/`);

export const getComplaintHistory = () =>
  axiosInstance.get("/complaints/history/");
