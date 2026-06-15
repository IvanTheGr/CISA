import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export const fetchMyTickets = () =>
  axios.get(`${API_BASE_URL}/my/tickets`, {
    withCredentials: true,
  });

export const fetchDashboardSummary = () =>
  axios.get(`${API_BASE_URL}/my/dashboard-summary`, {
    withCredentials: true,
  });