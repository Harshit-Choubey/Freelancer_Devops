/**
 * API Service — Frontend HTTP client (Axios-based)
 *
 * Requirements:
 * - config.js must be loaded first (sets window.AppConfig)
 * - axios loaded via CDN before this script
 * - services/auth.js loaded after this for AuthService.logout()
 *
 * All responses return the raw Axios response.data which is
 * already the backend envelope: { success, message, data }
 */

const api = axios.create({
  baseURL: window.AppConfig.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — Attach Bearer Token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Normalize & Handle 401 ───────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized — token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Notify the SPA router without a page reload
      window.dispatchEvent(new Event('auth-unauthorized'));
    }

    return Promise.reject(error.response?.data || error);
  }
);

// ─── Auth Methods ─────────────────────────────────────────────────────────────
api.getMe = () => api.get('/auth/me');

// ─── Job Methods ──────────────────────────────────────────────────────────────
api.getAllJobs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/jobs${qs ? '?' + qs : ''}`);
};

api.getAllJobsAuth = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/jobs/browse${qs ? '?' + qs : ''}`);
};

api.getMyJobs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/jobs/my/jobs${qs ? '?' + qs : ''}`);
};

api.getMyApplications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/jobs/my/applications${qs ? '?' + qs : ''}`);
};

api.getJobById = (id) => api.get(`/jobs/${id}`);

api.createJob = (data) => api.post('/jobs', data);

api.updateJob = (id, data) => api.put(`/jobs/${id}`, data);

api.deleteJob = (id) => api.delete(`/jobs/${id}`);

api.applyToJob = (jobId, data) => api.post(`/jobs/${jobId}/apply`, data);

api.getJobApplications = (jobId) => api.get(`/jobs/${jobId}/applications`);

api.updateApplicationStatus = (applicationId, status) =>
  api.put(`/jobs/applications/${applicationId}/status`, { status });

// ─── Message Methods ──────────────────────────────────────────────────────────
api.getJobMessages = (jobId) => api.get(`/messages/job/${jobId}`);

api.sendMessage = (jobId, content) => api.post('/messages', { jobId, content });

api.getMyConversations = () => api.get('/messages/conversations');

// ─── User Methods ─────────────────────────────────────────────────────────────
api.updateProfile = (data) => api.put('/users/profile', data);

api.changePassword = (data) => api.put('/users/password', data);

api.getDashboardStats = () => api.get('/users/dashboard/stats');

api.getFreelancers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/users/freelancers${qs ? '?' + qs : ''}`);
};

api.getFreelancerById = (id) => api.get(`/users/freelancers/${id}`);

api.uploadProfilePicture = (formData) =>
  api.post('/users/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Monitoring ───────────────────────────────────────────────────────────────
api.healthCheck = () => api.get('/monitoring/health');
api.readinessCheck = () => api.get('/monitoring/ready');

// Expose globally so modular ES-module components can access it
window.api = api;
