/* api.js — */

const BASE = '/api';

// Token Management
const TOKEN_KEY = 'agrisense_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Core Fetch
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}

const get = (path) => request(path);
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const patch = (path, body = {}) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

// Auth
export const authApi = {
  register: (data) => post('/auth/register', data),
  login: (data) => post('/auth/login', data),
  me: () => get('/auth/me'),
  updateProfile: (data) => patch('/auth/profile', data),
  changePin: (data) => patch('/auth/change-pin', data),
};

// Farms
export const farmsApi = {
  getAll: () => get('/farms'),
  getById: (id) => get(`/farms/${id}`),
  create: (data) => post('/farms', data),
  update: (id, data) => patch(`/farms/${id}`, data),
  delete: (id) => del(`/farms/${id}`),
};

// Crops
export const cropsApi = {
  getAll: (farmId) => get(`/crops${farmId ? `?farmId=${farmId}` : ''}`),
  create: (data) => post('/crops', data),
  update: (id, data) => patch(`/crops/${id}`, data),
  delete: (id) => del(`/crops/${id}`),
};

// Soil Readings
export const soilApi = {
  getAll: (farmId) => get(`/soil-readings${farmId ? `?farmId=${farmId}` : ''}`),
  create: (data) => post('/soil-readings', data),
  delete: (id) => del(`/soil-readings/${id}`),
};

// Crop Analyses
export const cropAnalysesApi = {
  getAll: (farmId) => get(`/crop-analyses${farmId ? `?farmId=${farmId}` : ''}`),
  create: (data) => post('/crop-analyses', data),
  delete: (id) => del(`/crop-analyses/${id}`),
};

// Risk Alerts
export const riskAlertsApi = {
  getAll: (farmId) => get(`/risk-alerts${farmId ? `?farmId=${farmId}` : ''}`),
  create: (data) => post('/risk-alerts', data),
  updateStatus: (id, status) => patch(`/risk-alerts/${id}/status`, { status }),
  delete: (id) => del(`/risk-alerts/${id}`),
};

// Advisories
export const advisoriesApi = {
  getAll: () => get('/advisories'),
  toggleSave: (id) => patch(`/advisories/${id}/save`),
};

// Market Prices
export const marketPricesApi = {
  getAll: () => get('/market-prices'),
};

// Notifications
export const notificationsApi = {
  getAll: () => get('/notifications'),
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: () => patch('/notifications/read-all'),
  clearAll: () => del('/notifications'),
};