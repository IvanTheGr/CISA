import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

axios.defaults.withCredentials = true;

export const getUsers = (page = 0, size = 10) =>
  axios.get(`${API_BASE_URL}/users`, { params: { page, size } });

export const createUser = (data) =>
  axios.post(`${API_BASE_URL}/users`, data);

export const updateUser = (id, data) =>
  axios.put(`${API_BASE_URL}/users/${id}`, data);

export const deleteUser = (id) =>
  axios.delete(`${API_BASE_URL}/users/${id}`);
