import axios from "axios";

// const API_BASE_URL = "/api";
const API_BASE_URL = "/api";

/**
 * GET /api/products/my-products
 * Returns: ProductResponseDTO[]
 * Auth: cookie-based (axios.defaults.withCredentials = true set in authApi.js)
 */
export const fetchMyProducts = () =>
  axios.get(`${API_BASE_URL}/api/products/my-products`, {
    withCredentials: true,
  });
