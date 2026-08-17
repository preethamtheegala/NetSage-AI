import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Cases API
export const casesApi = {
  getAll: (params) => api.get('/cases', { params }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
};

// Diagnosis API
export const diagnosisApi = {
  run: (data) => api.post('/diagnosis', data),
  getById: (id) => api.get(`/diagnosis/${id}`),
};

// Rule Checker API
export const ruleCheckerApi = {
  check: (data) => api.post('/rule-checker', data),
};

// Reviews API
export const reviewsApi = {
  submit: (data) => api.post('/reviews', data),
  getAll: (params) => api.get('/reviews', { params }),
  getPending: () => api.get('/reviews/pending'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: () => api.get('/analytics'),
  getResponsibleAI: () => api.get('/responsible-ai'),
};

export default api;
