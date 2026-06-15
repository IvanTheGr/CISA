import axios from "axios";

const API_BASE_URL = "/api";

export const fetchMyTickets = () =>
  axios.get(`${API_BASE_URL}/my/tickets`, {
    withCredentials: true,
  });

export const fetchDashboardSummary = () =>
  axios.get(`${API_BASE_URL}/my/dashboard-summary`, {
    withCredentials: true,
  });