import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

export async function createManager(token, managerData) {
  axios.post(
    `${BASE_URL}/users/create-manager/`,
    managerData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function createSales(token, data) {
  return axios.post(
    `${BASE_URL}/users/create-sales/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
