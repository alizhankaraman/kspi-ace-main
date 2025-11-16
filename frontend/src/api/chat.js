import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

export const getLinkedConsumers = async (token) =>
  axios.get(`${BASE_URL}/users/supplier/consumers/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getChatHistory = async (token, userId) =>
  axios.get(`${BASE_URL}/chat/history/${userId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendMessage = async (token, receiverId, content) =>
  axios.post(
    `${BASE_URL}/chat/send/`,
    { receiver: receiverId, content },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
