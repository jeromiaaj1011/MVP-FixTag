import axios from 'axios';

/**
 * FixTag Centralized Axios API Client
 * Configured with environment-based base URL and default JSON headers.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

/**
 * Assets API Endpoints
 */
export const getAssets = async () => {
  const response = await apiClient.get('/api/assets');
  return response.data;
};

export default apiClient;
