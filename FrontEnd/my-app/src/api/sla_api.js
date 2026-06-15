import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const fetchSlaConfigs      = ()        => api.get("/sla-config");
export const fetchSlaConfigById   = (id)      => api.get(`/sla-config/${id}`);
export const createSlaConfig      = (dto)     => api.post("/sla-config", dto);
export const updateSlaConfig      = (id, dto) => api.put(`/sla-config/${id}`, dto);
export const deleteSlaConfig      = (id)      => api.delete(`/sla-config/${id}`);

export const fetchPartnerLookup   = () => api.get("/sla-config/lookup/partners");
export const fetchProductLookup   = () => api.get("/sla-config/lookup/products");
export const fetchPriorityLookup  = () => api.get("/sla-config/lookup/priorities");
