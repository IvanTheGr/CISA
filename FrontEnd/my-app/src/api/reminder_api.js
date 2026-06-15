import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const fetchReminderConfigs = () => api.get("/reminder/config");

export const saveReminderConfig   = (dto)             => api.post("/reminder/config", dto);

export const triggerReminders     = ()                => api.post("/reminder/trigger");

export const testReminderChannel  = (channel, config, reminderId) => api.post("/reminder/test", { channel, config, reminderId });
