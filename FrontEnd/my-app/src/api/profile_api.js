import axios from "axios";
import { API_BASE_URL } from "./apiConfig";
// withCredentials globally set in authApi.js (axios.defaults.withCredentials = true)
// All profile calls inherit that setting

/**
 * GET /api/profile
 * Returns: UserProfileResponseDTO
 */
export const getProfile = () =>
  axios.get(`${API_BASE_URL}/api/profile`, { withCredentials: true });

/**
 * PUT /api/profile
 * Payload: { fullName, email, phone }
 * Returns: { message, data: UserProfileResponseDTO }
 */
export const updateProfile = (payload) =>
  axios.put(`${API_BASE_URL}/api/profile`, payload, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
