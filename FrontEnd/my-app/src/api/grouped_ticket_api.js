import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export const fetchGroupedOpenTickets = () =>
  axios.get(`${API_BASE_URL}/ticket/grouped-open`, {
    withCredentials: true,
  });

export const fetchTicketDetailApi = (ticketId) =>
  axios.get(`${API_BASE_URL}/ticket/detail/${ticketId}`, {
    withCredentials: true,
  });

export const fetchTicketMessagesApi = (ticketId) =>
  axios.get(`${API_BASE_URL}/message/by-ticket-id`, {
    params: { id: ticketId },
    withCredentials: true,
  });

export const takeTicketApi = (ticketId) =>
  axios.put(`${API_BASE_URL}/ticket/take/${ticketId}`, {}, {
    withCredentials: true,
  });

export const assignTicketPicApi = (ticketId, userId) =>
  axios.put(
    `${API_BASE_URL}/ticket/assign-pic/${ticketId}`,
    { userId },
    { withCredentials: true }
  );

export const sendTicketMessageApi = (ticketId, formData) =>
  axios.post(`${API_BASE_URL}/message/send/${ticketId}`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const closeTicketApi = (ticketId, payload) =>
  axios.put(`${API_BASE_URL}/ticket/close/${ticketId}`, payload, {
    withCredentials: true,
  });

export const fetchSupportUsersApi = () =>
  axios.get(`${API_BASE_URL}/support-users`, {
    withCredentials: true,
  });

export const submitIncidentLogAndDownloadApi = (ticketId, payload) =>
  axios.post(`${API_BASE_URL}/incident/submit/${ticketId}`, payload, {
    withCredentials: true,
    responseType: "blob",
    headers: {
      "Content-Type": "application/json",
    },
  });