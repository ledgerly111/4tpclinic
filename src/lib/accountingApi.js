const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new ApiError(data.error || 'Request failed.', response.status);
    }

    return data;
}

export async function fetchInvoices() {
    return request('/invoices');
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
