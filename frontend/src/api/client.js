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
 * Retrieve a single asset by tag with its issue history
 * GET /api/assets/{assetTag}
 */
export const getAssetByTag = async (assetTag) => {
  const response = await apiClient.get(`/api/assets/${encodeURIComponent(assetTag)}`);
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

/**
 * Update issue status and optional resolution notes
 * PATCH /api/issues/{issueId}/status
 * Payload: { status, resolution_notes }
 */
export const updateIssueStatus = async (issueId, status, resolutionNotes = null) => {
  const payload = { status };
  if (resolutionNotes !== null && resolutionNotes !== undefined && resolutionNotes !== '') {
    payload.resolution_notes = resolutionNotes;
  }
  const response = await apiClient.patch(`/api/issues/${issueId}/status`, payload);
  return response.data;
};

export default apiClient;
