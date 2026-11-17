import {
  cacheReadResponse,
  configureOffline,
  emptyListFor,
  enqueueWrite,
  hasPendingWrites,
  isQueueableWrite,
  overlayPending,
  readCachedResponse,
} from './offlineSync';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const SESSION_KEY = 'clinic_auth_session';
const LEGACY_TENANT_STORAGE_KEY = 'clinic_selected_tenant';
const TENANT_STORAGE_KEY_PREFIX = 'clinic_selected_tenant_by_user:';

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

function getScopedTenantStorageKey(userId) {
  return `${TENANT_STORAGE_KEY_PREFIX}${userId}`;
}

function parseStoredClinicId(raw) {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.clinicId || '';
  } catch {
    return '';
  }
}

function getSelectedClinicId() {
  const legacyClinicId = parseStoredClinicId(sessionStorage.getItem(LEGACY_TENANT_STORAGE_KEY));
  if (legacyClinicId) return legacyClinicId;

  const userId = getStoredSession()?.userId;
  if (!userId) return '';

  return parseStoredClinicId(localStorage.getItem(getScopedTenantStorageKey(userId)));
}

function clearSelectedClinic() {
  sessionStorage.removeItem(LEGACY_TENANT_STORAGE_KEY);

  const userId = getStoredSession()?.userId;
  if (userId) {
    localStorage.removeItem(getScopedTenantStorageKey(userId));
  }
}

async function rawRequest(path, options = {}, hasRetried = false) {
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

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('No internet connection.', 0);
  }

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (
    !response.ok &&
    !hasRetried &&
    clinicId &&
    response.status === 403 &&
    data?.error === 'Selected clinic is not accessible.'
  ) {
    clearSelectedClinic();
    return rawRequest(path, options, true);
  }

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed.', response.status);
  }

  return data;
}

// Network down, server down, or database unavailable (e.g. D1 quota exhausted).
function isServerUnavailable(error) {
  const status = Number(error?.status || 0);
  return !status || status >= 500;
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

async function request(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();

  if (method === 'GET') {
    try {
      const data = await rawRequest(path, options);
      cacheReadResponse(path, data);
      return overlayPending(path, data);
    } catch (error) {
      if (!isServerUnavailable(error)) throw error;
      const cached = readCachedResponse(path) ?? emptyListFor(path);
      if (cached) return overlayPending(path, { ...cached, offline: true });
      // Nothing cached (e.g. an invoice created offline): build it from the queue.
      const synthesized = overlayPending(path, {});
      if (synthesized && Object.keys(synthesized).length > 0) return { ...synthesized, offline: true };
      throw error;
    }
  }

  if (isQueueableWrite(method, path)) {
    const body = parseBody(options.body);
    // Creates carry a client-generated id so a retry can never duplicate.
    if (method === 'POST' && !body.id) body.id = crypto.randomUUID();
    // Keep strict ordering: once something is queued, later edits queue too.
    if (hasPendingWrites()) return enqueueWrite(method, path, body);
    try {
      return await rawRequest(path, { ...options, body: JSON.stringify(body) });
    } catch (error) {
      if (!isServerUnavailable(error)) throw error;
      return enqueueWrite(method, path, body);
    }
  }

  return rawRequest(path, options);
}

configureOffline({
  send: (path, options) => rawRequest(path, options),
  context: () => ({
    userId: getStoredSession()?.userId || '',
    clinicId: getSelectedClinicId(),
  }),
});

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

export async function updateOrganizationClinicLimitApi(organizationId, clinicLimit) {
  return request(`/super-admin/organizations/${encodeURIComponent(organizationId)}/clinic-limit`, {
    method: 'PATCH',
    body: JSON.stringify({ clinicLimit }),
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

export async function updateStaffPermissionsApi(userId, permissions) {
  return request(`/admin/users/${encodeURIComponent(userId)}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify({ permissions }),
  });
}

export { request, getStoredSession, setStoredSession, clearStoredSession, getAuthToken, ApiError };
