import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fetchMyCustomerRatingApi = () => {
  return api.get("/customer-rating/my");
};

export const submitCustomerRatingApi = (ticketId, payload) => {
  return api.post(`/customer-rating/submit/${ticketId}`, payload);
};