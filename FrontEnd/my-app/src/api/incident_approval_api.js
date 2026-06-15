import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fetchIncidentApprovalApi = () => {
  return api.get("/incident-approval");
};

export const fetchIncidentApprovalDetailApi = (ticketId) => {
  return api.get(`/incident-approval/detail/${ticketId}`);
};

export const approveIncidentApi = (ticketId) => {
  return api.put(`/incident-approval/approve/${ticketId}`);
};

export const downloadIncidentApprovalWordApi = (ticketId) => {
  return api.get(`/incident-approval/download/${ticketId}`, {
    responseType: "blob",
  });
};