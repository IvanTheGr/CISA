import axios from "axios";

const API_BASE_URL = "/api";

/**
 * Shared Axios instance for all Metabase-related requests.
 * withCredentials: true ensures the JWT HTTP-only cookie is sent.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
