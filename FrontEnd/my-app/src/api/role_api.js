import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const API = API_BASE_URL;
axios.defaults.withCredentials = true;

export const getRoles = () =>
  axios.get(`${API}/api/roles`);

export const getRoleById = (id) =>
  axios.get(`${API}/api/roles/${id}`);

export const createRole = (data) =>
  axios.post(`${API}/api/roles`, data);

export const updateRole = (id, data) =>
  axios.put(`${API}/api/roles/${id}`, data);

export const deleteRole = (id) =>
  axios.delete(`${API}/api/roles/${id}`);
