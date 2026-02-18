import { request } from './authApi';

export async function fetchPatients(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/patients${query ? `?${query}` : ''}`);
}

export async function createPatient(payload) {
  return request('/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePatient(patientId, payload) {
  return request(`/patients/${encodeURIComponent(patientId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePatient(patientId) {
  return request(`/patients/${encodeURIComponent(patientId)}`, {
    method: 'DELETE',
  });
}

export async function fetchServices(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/services${query ? `?${query}` : ''}`);
}

export async function createService(payload) {
  return request('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteService(serviceId) {
  return request(`/services/${encodeURIComponent(serviceId)}`, {
    method: 'DELETE',
  });
}

export async function fetchInventory(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/inventory${query ? `?${query}` : ''}`);
}

export async function createInventoryItem(payload) {
  return request('/inventory', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateInventoryItem(itemId, payload) {
  return request(`/inventory/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function restockInventoryItem(itemId, payload) {
  return request(`/inventory/${encodeURIComponent(itemId)}/restock`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchAppointments(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/appointments${query ? `?${query}` : ''}`);
}

export async function createAppointment(payload) {
  return request('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAppointment(appointmentId, payload) {
  return request(`/appointments/${encodeURIComponent(appointmentId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateAppointmentStatus(appointmentId, status) {
  return request(`/appointments/${encodeURIComponent(appointmentId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchReportsOverview() {
  return request('/reports/overview');
}
