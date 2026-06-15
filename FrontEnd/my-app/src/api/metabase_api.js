import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

/**
 * Shared Axios instance for all Metabase-related requests.
 * withCredentials: true ensures the JWT HTTP-only cookie is sent.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
