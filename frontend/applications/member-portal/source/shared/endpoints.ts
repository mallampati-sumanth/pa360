import { apiClient } from './api-client';

export const authEndpoints = {
  login: (data: { email: string; password: string }) => apiClient.post('/auth/login/', data),
  logout: () => apiClient.post('/auth/logout/'),
  refreshToken: (data: { refresh: string }) => apiClient.post('/auth/token/refresh/', data),
  profile: () => apiClient.get('/auth/profile/'),
  changePassword: (data: any) => apiClient.post('/auth/change-password/', data),
};

export const patientEndpoints = {
  list: (params?: any) => apiClient.get('/patients/', { params }),
  retrieve: (id: string) => apiClient.get(`/patients/${id}/`),
  create: (data: any) => apiClient.post('/patients/', data),
  update: (id: string, data: any) => apiClient.patch(`/patients/${id}/`, data),
  linkProvisional: (id: string, data: any) => apiClient.post(`/patients/${id}/link_provisional/`, data),
};

export const providerEndpoints = {
  list: (params?: any) => apiClient.get('/providers/', { params }),
  retrieve: (id: string) => apiClient.get(`/providers/${id}/`),
};

export const payerEndpoints = {
  list: (params?: any) => apiClient.get('/payers/', { params }),
  retrieve: (id: string) => apiClient.get(`/payers/${id}/`),
};

export const planEndpoints = {
  list: (params?: any) => apiClient.get('/plans/', { params }),
  retrieve: (id: string) => apiClient.get(`/plans/${id}/`),
};

export const serviceEndpoints = {
  list: (params?: any) => apiClient.get('/services/', { params }),
  retrieve: (code: string) => apiClient.get(`/services/${code}/`),
};

export const authorizationEndpoints = {
  list: (params?: any) => apiClient.get('/authorizations/', { params }),
  retrieve: (id: string) => apiClient.get(`/authorizations/${id}/`),
  create: (data: any) => apiClient.post('/authorizations/', data),
  delete: (id: string) => apiClient.delete(`/authorizations/${id}/`),
  update: (id: string, data: any) => apiClient.patch(`/authorizations/${id}/`, data),
  checkPARequirement: (id: string) => apiClient.post(`/authorizations/${id}/check_pa_requirement/`),
  checkCompleteness: (id: string) => apiClient.post(`/authorizations/${id}/check_completeness/`),
  submit: (id: string) => apiClient.post(`/authorizations/${id}/submit/`),
  submitToPayer: (id: string) => apiClient.post(`/authorizations/${id}/submit_to_payer/`),
  missingInfo: (id: string) => apiClient.get(`/authorizations/${id}/missing_info/`),
  statusHistory: (id: string) => apiClient.get(`/authorizations/${id}/status_history/`),
  aiAnalyze: (id: string) => apiClient.post(`/authorizations/${id}/ai_analyze/`),
  approveForSubmission: (id: string, data: any) => apiClient.post(`/authorizations/${id}/approve_for_submission/`, data),
  validateCoverage: (id: string, data: any) => apiClient.post(`/authorizations/${id}/validate_coverage/`, data),
  recordDecision: (id: string) => apiClient.post(`/authorizations/${id}/record_decision/`),
  recordServiceDelivery: (id: string) => apiClient.post(`/authorizations/${id}/record_service_delivery/`),
  billingHandoff: (id: string) => apiClient.post(`/authorizations/${id}/billing_handoff/`),
  retroAuth: (id: string, data: any) => apiClient.post(`/authorizations/${id}/retro_auth/`, data),
  appeal: (id: string, data: any) => apiClient.post(`/authorizations/${id}/appeal/`, data),
  checkClinicalChange: (id: string, data: any) => apiClient.post(`/authorizations/${id}/check_clinical_change/`, data),
  exceptionQueue: (params?: any) => apiClient.get('/authorizations/exception_queue/', { params }),
  managerSummary: () => apiClient.get('/authorizations/manager_summary/'),
};

export const documentEndpoints = {
  list: (params?: any) => apiClient.get('/documents/', { params }),
  upload: (formData: FormData) => apiClient.post('/documents/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  retrieve: (id: string) => apiClient.get(`/documents/${id}/`),
  delete: (id: string) => apiClient.delete(`/documents/${id}/`),
};

export const payerResponseEndpoints = {
  list: (params?: any) => apiClient.get('/payer-responses/', { params }),
  retrieve: (id: string) => apiClient.get(`/payer-responses/${id}/`),
  process: (id: string) => apiClient.post(`/payer-responses/${id}/process/`),
};

export const auditEndpoints = {
  list: (params?: any) => apiClient.get('/audit/logs/', { params }),
};

export const slaEndpoints = {
  breaches: (params?: any) => apiClient.get('/sla/breaches/', { params }),
  acknowledge: (id: string) => apiClient.post(`/sla/breaches/${id}/acknowledge/`),
};

export const healthEndpoints = {
  check: () => apiClient.get('/health/'),
};
