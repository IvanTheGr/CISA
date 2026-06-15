import axios from "axios";

// const API = "/api";
const API = "/api";

axios.defaults.withCredentials = true;

export const loginApi = (login, password) => {
  return axios.post(`${API}/auth/login`, {
    login,
    password
  });
};