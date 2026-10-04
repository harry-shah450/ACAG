import apiClient from './client';

// ==================== AUTH & USERS ====================
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  logout: (refreshToken) => apiClient.post('/auth/logout/', { refresh_token: refreshToken }),
  getMe: () => apiClient.get('/auth/me/'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh/', { refresh: refreshToken }),
};

export const usersApi = {
  getUsers: (params) => apiClient.get('/users/', { params }),
  getUser: (id) => apiClient.get(`/users/${id}/`),
  registerUser: (data) => apiClient.post('/users/register/', data),
  updateUser: (id, data) => apiClient.patch(`/users/${id}/`, data),
  activateUser: (id) => apiClient.post(`/users/${id}/activate/`),
  deactivateUser: (id) => apiClient.delete(`/users/${id}/`),
};

// ==================== JUNIOR ENGINEERS ====================
export const engineersApi = {
  getEngineers: (params) => apiClient.get('/engineers/', { params }),
  createEngineer: (data) => apiClient.post('/engineers/', data),
};


// ==================== PROJECTS & HOUSES ====================
export const projectsApi = {
  getProjects: (params) => apiClient.get('/projects/', { params }),
  getProject: (id) => apiClient.get(`/projects/${id}/`),
  createProject: (data) => apiClient.post('/projects/', data),
  updateProject: (id, data) => apiClient.patch(`/projects/${id}/`, data),
  deleteProject: (id) => apiClient.delete(`/projects/${id}/`),
  bulkImport: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return apiClient.post('/projects/bulk_import/', formDataOrJson, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post('/projects/bulk_import/', formDataOrJson);
  },
  downloadTemplate: () => apiClient.get('/projects/download_template/', { responseType: 'blob' }),
  
  getMilestones: (id) => apiClient.get(`/projects/${id}/milestones/`),
  completeMilestone: (id, milestoneNo, data) =>
    apiClient.post(`/projects/${id}/milestones/${milestoneNo}/complete/`, data),

  getVisits: (id) => apiClient.get(`/projects/${id}/visits/`),
  createVisit: (id, data) => apiClient.post(`/projects/${id}/visits/`, data),

  getPhotos: (id, params) => apiClient.get(`/projects/${id}/photos/`, { params }),
  uploadPhotos: (id, data) => apiClient.post(`/projects/${id}/photos/`, data),

  updateCompliance: (id, data) => apiClient.patch(`/projects/${id}/compliance/`, data),
};

export const housesApi = {
  getHouses: (params) => apiClient.get('/projects/', { params }),
  getHouse: (id) => apiClient.get(`/projects/${id}/`),
  createHouse: (data) => apiClient.post('/projects/', data),
  updateHouse: (id, data) => apiClient.patch(`/projects/${id}/`, data),
  deleteHouse: (id) => apiClient.delete(`/projects/${id}/`),
  bulkImport: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return apiClient.post('/projects/bulk_import/', formDataOrJson, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post('/projects/bulk_import/', formDataOrJson);
  },
  downloadTemplate: () => apiClient.get('/projects/download_template/', { responseType: 'blob' }),
};

// ==================== COMPLIANCE & SITE RISK ====================
export const complianceApi = {
  getScores: (id) => apiClient.get(`/compliance/projects/${id}/scores/`),
  getHSEChecks: (id, params) => apiClient.get(`/compliance/projects/${id}/hse/`, { params }),
  submitHSEChecklist: (id, data) => apiClient.post(`/compliance/projects/${id}/hse/`, data),
  getESSChecks: (id, params) => apiClient.get(`/compliance/projects/${id}/ess/`, { params }),
  submitESSChecklist: (id, data) => apiClient.post(`/compliance/projects/${id}/ess/`, data),
  getSummary: (id) => apiClient.get(`/compliance/projects/${id}/summary/`),
  getTrend: (id) => apiClient.get(`/compliance/projects/${id}/trend/`),
  updateStatus: (id, data) => apiClient.patch(`/compliance/projects/${id}/status/`, data),
  getSiteRiskRegister: (params) => apiClient.get('/compliance/site-risk/', { params }),
};

// ==================== REVIEW QUEUE & AI ====================
export const reviewApi = {
  getQueue: (params) => apiClient.get('/review/queue/', { params }),
  getReviewDetail: (projectId, milestoneNo) =>
    apiClient.get(`/review/${projectId}/${milestoneNo}/`),
  submitReview: (projectId, milestoneNo, data) =>
    apiClient.post(`/review/${projectId}/${milestoneNo}/submit/`, data),
  getReviewHistory: (projectId) => apiClient.get(`/review/projects/${projectId}/history/`),
  checkEligibility: (projectId, milestoneNo) =>
    apiClient.get(`/review/${projectId}/${milestoneNo}/eligible/`),
  
  // AI Vision
  analyzePhoto: (data) => apiClient.post('/ai/analyze-photo/', data),
  batchAnalyze: (data) => apiClient.post('/ai/batch-analyze/', data),
};

// ==================== HANDOVER ====================
export const handoverApi = {
  getSummary: () => apiClient.get('/handover/summary/'),
  getRecords: (params) => apiClient.get('/handover/records/', { params }),
  getProjectHandover: (id) => apiClient.get(`/projects/${id}/handover/`),
  updateProjectHandover: (id, data) => apiClient.patch(`/projects/${id}/handover/`, data),
  signHandover: (id, data) => apiClient.post(`/projects/${id}/handover/sign/`, data),
  checkEligibility: (id) => apiClient.get(`/projects/${id}/handover/eligible/`),
  getCertificateUrl: (id) => `/projects/${id}/certificate/`,
};

// ==================== REPORTS ====================
export const reportsApi = {
  getDPRUrl: (params) => {
    const search = new URLSearchParams(params).toString();
    return `/reports/dpr/${search ? `?${search}` : ''}`;
  },
  getDistrictExcelUrl: (params) => {
    const search = new URLSearchParams(params).toString();
    return `/reports/district-excel/${search ? `?${search}` : ''}`;
  },
  getHandoverReportUrl: (params) => {
    const search = new URLSearchParams(params).toString();
    return `/reports/handover/${search ? `?${search}` : ''}`;
  },
  getReportHistory: (params) => apiClient.get('/reports/', { params }),
  generateReport: (data) => apiClient.post('/reports/generate/', data),
};
