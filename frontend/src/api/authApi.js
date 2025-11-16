import axiosClient from './axiosClient';

const authApi = {
  // Login: access + refresh + user_id
  login: async (username, password) => {
    const response = await axiosClient.post('/auth/token/', {
      username,
      password,
    });

    const data = response.data;

    // Save tokens + user_id for WebSocket
    if (data.access) localStorage.setItem("accessToken", data.access);
    if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
    if (data.user_id) localStorage.setItem("user_id", data.user_id);

    return data;
  },

  getProfile: async () => {
    const response = await axiosClient.get('/users/me/');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await axiosClient.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export default authApi;
