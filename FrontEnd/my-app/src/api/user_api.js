import axios from "axios";

const API = "/api";
axios.defaults.withCredentials = true;

export const getUsers = (page = 0, size = 10) =>
  axios.get(`${API}/api/users`, { params: { page, size } });

export const createUser = (data) =>
  axios.post(`${API}/api/users`, data);

export const updateUser = (id, data) =>
  axios.put(`${API}/api/users/${id}`, data);

export const deleteUser = (id) =>
  axios.delete(`${API}/api/users/${id}`);
