import axios from "axios";

const BASE_URL = "https://kspi-ace-main.onrender.com/api";

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
