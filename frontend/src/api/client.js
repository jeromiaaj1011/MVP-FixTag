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

/**
 * Issues API Endpoints
 * Supports optional status filter query parameter.
 */
export const getIssues = async (status = null) => {
  const config = status && status !== 'ALL' ? { params: { status } } : {};
  const response = await apiClient.get('/api/issues', config);
  return response.data;
};

/**
 * Create a new issue for an asset
 * POST /api/issues
 * Payload: { title, description, priority, asset_id }
 */
export const createIssue = async (issueData) => {
  const response = await apiClient.post('/api/issues', issueData);
  return response.data;
};

export default apiClient;
