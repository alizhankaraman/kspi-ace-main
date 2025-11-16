import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://https://kspi-ace-main.onrender.com/api/",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refreshment of token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const res = await axios.post("https://kspi-ace-main.onrender.com/api/auth/token/refresh/", {
            refresh,
          });
          localStorage.setItem("access", res.data.access);
          axiosInstance.defaults.headers.Authorization = `Bearer ${res.data.access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
