import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

axios.defaults.withCredentials = true;

export const loginApi = (login, password) => {
  return axios.post(`${API_BASE_URL}/auth/login`, {
    login,
    password
  });
};