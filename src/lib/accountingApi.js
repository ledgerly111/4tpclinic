import { request } from './authApi';

export async function fetchInvoices() {
    return request('/invoices');
}

export async function fetchInvoiceById(invoiceId) {
    return request(`/invoices/${encodeURIComponent(invoiceId)}`);
}

export async function fetchAccountingSummary() {
    return request('/accounting/summary');
}

export async function createInvoice(payload) {
    return request('/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function markInvoicePaid(invoiceId) {
    return request(`/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid', method: 'manual' }),
    });
}
