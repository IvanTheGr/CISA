import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fetchMyTicketHistoryApi = () => {
  return api.get("/ticket-history/my");
};

export const fetchTicketHistoryDetailApi = (ticketId) => {
  return api.get(`/ticket-history/detail/${ticketId}`);
};

export const downloadIncidentWordApi = (ticketId) => {
  return api.get(`/ticket-history/download/${ticketId}`, {
    responseType: "blob",
  });
};