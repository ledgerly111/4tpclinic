const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const SESSION_KEY = 'clinic_auth_session';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function getAuthToken() {
  return getStoredSession()?.token || '';
}

function getSelectedClinicId() {
  try {
    const raw = sessionStorage.getItem('clinic_selected_tenant');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.clinicId || '';
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const clinicId = getSelectedClinicId();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (clinicId && !headers['X-Clinic-Id']) {
    headers['X-Clinic-Id'] = clinicId;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed.', response.status);
  }

  return data;
}

export async function loginApi(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getSessionApi() {
  return request('/auth/session');
}

export async function logoutApi() {
  return request('/auth/logout', { method: 'POST' });
}

export async function fetchTenantBootstrapApi() {
  return request('/tenant/bootstrap');
}

export async function fetchSuperAdminOverviewApi() {
  return request('/super-admin/overview');
}

export async function createOrganizationWithAdminApi(payload) {
  return request('/super-admin/organizations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createAdminForOrganizationApi(payload) {
  return request('/super-admin/admins', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminSupervisionApi() {
  return request('/admin/supervision');
}

export async function createClinicApi(payload) {
  return request('/admin/clinics', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createStaffApi(payload) {
  return request('/admin/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resetStaffPasswordApi(userId, newPassword) {
  return request(`/admin/users/${encodeURIComponent(userId)}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  });
}

export { request, getStoredSession, setStoredSession, clearStoredSession, getAuthToken, ApiError };
