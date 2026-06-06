import { request } from './authApi';

function buildQuery(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, String(value));
        }
    });
    const query = search.toString();
    return query ? `?${query}` : '';
}

export async function fetchInvoices(params = {}) {
    return request(`/invoices${buildQuery(params)}`);
}

export async function fetchInvoiceById(invoiceId) {
    return request(`/invoices/${encodeURIComponent(invoiceId)}`);
}

export async function fetchAccountingSummary(params = {}) {
    return request(`/accounting/summary${buildQuery(params)}`);
}

export async function fetchBillingSettings() {
    return request('/billing-settings');
}

export async function updateBillingSettings(payload) {
    return request('/billing-settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function createInvoice(payload) {
    return request('/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateInvoice(invoiceId, payload) {
    return request(`/invoices/${encodeURIComponent(invoiceId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function markInvoicePaid(invoiceId, payload = {}) {
    return request(`/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid', ...payload }),
    });
}
