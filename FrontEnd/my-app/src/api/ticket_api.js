import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= TICKET ================= */

/*
 * Jangan dipakai dulu di Edit/Delete page karena /ticket/all kamu masih rawan 500.
 * Tetap disediakan kalau page lain masih butuh.
 */
export const fetchTickets = (page = 0, size = 30) =>
  api.get("/ticket/all", {
    params: { page, size },
  });

export const fetchTicketById = (id) =>
  api.get("/ticket", {
    params: { id },
  });

/*
 * INI YANG DIPAKAI UNTUK SEARCH EDIT/DELETE
 * Search berdasarkan ticket_number, bukan id database.
 */
export const fetchTicketByNumber = (ticketNumber) =>
  api.get("/ticket/number", {
    params: { ticketNumber },
  });

export const updateTicket = (id, payload) =>
  api.put("/ticket/edit", payload, {
    params: { id },
  });

export const deleteTicketById = (id) => api.delete(`/ticket/${id}`);

export const deleteTicketByNumber = (ticketNumber) =>
  api.delete(`/ticket/number/${ticketNumber}`);

/* ================= MESSAGE ================= */

export const fetchMessagesByTicketId = (id) =>
  api.get("/message/by-ticket-id", {
    params: { id },
  });

export const fetchMessagesByTicketNumber = (ticketNumber) =>
  api.get("/message/by-number", {
    params: { ticketNumber },
  });

export const updateMessage = (id, payload) =>
  api.put("/message/edit", payload, {
    params: { id },
  });

/* ================= INCIDENT LOG ================= */

export const fetchIncidentByTicketNumber = (ticketNumber) =>
  api.get("/incident/by-number", {
    params: { ticketNumber },
  });

export const fetchIncidentLog = (ticketId) =>
  api.get("/incident", {
    params: { ticketId },
  });

export const updateIncidentLog = (ticketId, payload) =>
  api.put("/incident/edit", payload, {
    params: { ticketId },
  });

  export const searchTicketDropdown = (keyword = "") =>
  api.get("/ticket/search-dropdown", {
    params: { keyword },
  });

export default api;