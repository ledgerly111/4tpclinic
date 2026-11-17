// Offline support for invoices and appointments.
//
// - Successful GET responses are cached in localStorage so screens keep working
//   when the network (or the server/database) is unavailable.
// - Invoice and appointment writes that cannot reach the server are queued
//   locally and replayed in order when the server is reachable again.
// - Pending queued records are overlaid on list/detail responses so the user
//   sees their unsynced work immediately.

const QUEUE_KEY = 'clinic_offline_queue_v1';
const CACHE_PREFIX = 'clinic_offline_cache_v1:';
export const OFFLINE_EVENT = 'clinic-offline-sync';
const SYNC_INTERVAL_MS = 60 * 1000;

let sender = null;
let getContext = () => ({ userId: '', clinicId: '' });
let syncing = false;
let lastSyncError = '';
let started = false;

// ─── Storage helpers ─────────────────────────────────────────────────────────

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

function readQueue() {
    const queue = readJson(QUEUE_KEY, []);
    return Array.isArray(queue) ? queue : [];
}

function writeQueue(queue) {
    const ok = writeJson(QUEUE_KEY, queue);
    emitChange();
    return ok;
}

function emitChange() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(OFFLINE_EVENT));
    }
}

function newId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

// ─── Path classification ─────────────────────────────────────────────────────

function splitPath(path) {
    const [pathname, query = ''] = String(path).split('?');
    return { pathname, params: new URLSearchParams(query) };
}

function classifyWrite(method, path) {
    const { pathname } = splitPath(path);
    const m = String(method || 'GET').toUpperCase();
    if (m === 'POST' && pathname === '/invoices') return { kind: 'invoice', action: 'create' };
    if (m === 'POST' && pathname === '/appointments') return { kind: 'appointment', action: 'create' };
    let match = pathname.match(/^\/invoices\/([^/]+)\/status$/);
    if (m === 'PATCH' && match) return { kind: 'invoice', action: 'status', recordId: decodeURIComponent(match[1]) };
    match = pathname.match(/^\/invoices\/([^/]+)$/);
    if (m === 'PATCH' && match) return { kind: 'invoice', action: 'update', recordId: decodeURIComponent(match[1]) };
    match = pathname.match(/^\/appointments\/([^/]+)\/status$/);
    if (m === 'PATCH' && match) return { kind: 'appointment', action: 'status', recordId: decodeURIComponent(match[1]) };
    match = pathname.match(/^\/appointments\/([^/]+)$/);
    if (m === 'PATCH' && match) return { kind: 'appointment', action: 'update', recordId: decodeURIComponent(match[1]) };
    return null;
}

export function isQueueableWrite(method, path) {
    return Boolean(classifyWrite(method, path));
}

function isAuthPath(path) {
    const { pathname } = splitPath(path);
    return pathname === '/auth/login' || pathname === '/auth/logout';
}

// ─── Read cache ──────────────────────────────────────────────────────────────

function cacheKey(path, context) {
    return `${CACHE_PREFIX}${context.userId || 'anon'}|${context.clinicId || ''}|${path}`;
}

export function cacheReadResponse(path, data, clinicIdOverride) {
    if (isAuthPath(path)) return;
    const context = getContext();
    const clinicId = clinicIdOverride ?? context.clinicId;
    writeJson(cacheKey(path, { ...context, clinicId }), { savedAt: Date.now(), data });
}

export function readCachedResponse(path, clinicIdOverride) {
    const context = getContext();
    const clinicId = clinicIdOverride ?? context.clinicId;
    const exact = readJson(cacheKey(path, { ...context, clinicId }), null);
    if (exact) return exact.data;
    const { pathname } = splitPath(path);
    if (pathname !== path) {
        const base = readJson(cacheKey(pathname, { ...context, clinicId }), null);
        if (base) return base.data;
    }
    return null;
}

const EMPTY_LIST_SHAPES = {
    '/invoices': () => ({ invoices: [] }),
    '/appointments': () => ({ appointments: [] }),
    '/patients': () => ({ patients: [] }),
    '/services': () => ({ services: [] }),
    '/inventory': () => ({ items: [] }),
};

export function emptyListFor(path) {
    const { pathname } = splitPath(path);
    const factory = EMPTY_LIST_SHAPES[pathname];
    return factory ? factory() : null;
}

// ─── Queue ───────────────────────────────────────────────────────────────────

function pendingForContext(queue = readQueue()) {
    const { userId, clinicId } = getContext();
    return queue.filter((item) => item.userId === userId && (!clinicId || item.clinicId === clinicId));
}

export function hasPendingWrites() {
    const { userId } = getContext();
    return readQueue().some((item) => item.userId === userId && item.status === 'pending');
}

export function enqueueWrite(method, path, body) {
    const info = classifyWrite(method, path);
    if (!info) return null;
    const { userId, clinicId } = getContext();
    const payload = body && typeof body === 'object' ? { ...body } : {};
    if (info.action === 'create' && !payload.id) payload.id = newId();
    const recordId = info.recordId || payload.id;
    const entry = {
        qid: newId(),
        userId,
        clinicId,
        method: String(method).toUpperCase(),
        path,
        body: payload,
        kind: info.kind,
        action: info.action,
        recordId,
        status: 'pending',
        error: '',
        createdAt: new Date().toISOString(),
    };
    const queue = readQueue();
    queue.push(entry);
    if (!writeQueue(queue)) {
        throw new Error('Could not save offline: browser storage is full.');
    }
    scheduleSoonSync();
    return buildOptimisticResponse(entry);
}

function buildOptimisticResponse(entry) {
    const body = entry.body || {};
    if (entry.kind === 'invoice' && entry.action === 'create') {
        return {
            invoice: {
                id: entry.recordId,
                invoiceNumber: body.invoiceNumber || '',
                date: body.date || '',
                patient: body.patientName || '',
                amount: Number(body.total || 0),
                status: body.status || 'pending',
            },
            queued: true,
        };
    }
    if (entry.kind === 'appointment' && entry.action === 'create') {
        return { appointment: toAppointmentRow(entry), queued: true };
    }
    if (entry.kind === 'invoice') return { invoice: { id: entry.recordId }, queued: true };
    return { appointment: { id: entry.recordId }, queued: true };
}

export function getQueueSnapshot() {
    const { userId } = getContext();
    const items = readQueue().filter((item) => item.userId === userId);
    return {
        pending: items.filter((item) => item.status === 'pending'),
        failed: items.filter((item) => item.status === 'failed'),
        syncing,
        lastSyncError,
        online: typeof navigator === 'undefined' ? true : navigator.onLine !== false,
    };
}

export function discardQueued(qid) {
    writeQueue(readQueue().filter((item) => item.qid !== qid));
}

export function retryFailed() {
    const queue = readQueue().map((item) => (item.status === 'failed' ? { ...item, status: 'pending', error: '' } : item));
    writeQueue(queue);
    syncNow();
}

export function describeQueued(item) {
    const body = item.body || {};
    if (item.kind === 'invoice') {
        const label = body.invoiceNumber ? `Invoice ${body.invoiceNumber}` : 'Invoice';
        if (item.action === 'create') return `${label} (new) – ${body.patientName || ''}`.trim();
        if (item.action === 'status') return `${label} payment`;
        return `${label} (edit) – ${body.patientName || ''}`.trim();
    }
    const label = `Appointment ${body.date || ''} ${body.time || ''}`.trim();
    if (item.action === 'create') return `${label} – ${body.patientName || ''}`.trim();
    if (item.action === 'status') return `Appointment status → ${body.status || ''}`;
    return `Appointment edit – ${body.patientName || ''}`.trim();
}

// ─── Overlay pending records onto responses ──────────────────────────────────

function invoiceItemsFromPayload(body) {
    return (Array.isArray(body.items) ? body.items : []).map((item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);
        const gross = price * quantity;
        const discountAmount = Number(item.discountAmount || 0);
        const taxable = Math.max(0, gross - discountAmount);
        const gstPercent = Number(item.gstPercent || 0);
        const gstAmount = Number(((taxable * gstPercent) / 100).toFixed(2));
        return {
            id: item.id || newId(),
            name: item.name,
            price,
            quantity,
            total: Number((taxable + gstAmount).toFixed(2)),
            gross,
            discountPercent: Number(item.discountPercent || 0),
            discountAmount,
            gstPercent,
            gstAmount,
            taxableAmount: taxable,
            itemType: item.itemType || 'service',
            inventoryItemId: item.inventoryItemId || null,
            batchId: item.batchId || null,
            batchNumber: item.batchNumber || '',
            saleUnit: item.saleUnit || 'unit',
            mrpPrice: Number(item.mrpPrice || 0),
        };
    });
}

function paymentsFromPayload(body) {
    if (body.status !== 'paid') return [];
    const total = Number(body.total || 0);
    if (Array.isArray(body.payments) && body.payments.length > 0) {
        return body.payments
            .map((payment) => ({
                id: newId(),
                amount: Number(payment.amount || 0),
                date: body.date || '',
                method: payment.method || 'cash',
                notes: 'Saved offline',
            }))
            .filter((payment) => payment.amount > 0);
    }
    return [{ id: newId(), amount: total, date: body.date || '', method: body.paymentMethod || 'cash', notes: 'Saved offline' }];
}

function applyInvoicePayloadToRow(row, body) {
    const total = Number(body.total ?? row.amount ?? 0);
    const paid = body.status === 'paid' ? total : Number(row.paidAmount || 0);
    const items = invoiceItemsFromPayload(body);
    return {
        ...row,
        invoiceNumber: body.invoiceNumber || row.invoiceNumber,
        patient: body.patientName || row.patient,
        patientContact: body.patientContact ?? row.patientContact,
        date: body.date || row.date,
        amount: total,
        status: body.status || row.status,
        service: items.length > 0 ? items.map((item) => item.name).join(', ') : row.service,
        paidAmount: paid,
        outstandingAmount: Math.max(0, total - paid),
        items: items.length > 0
            ? items.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity, total: item.total, itemType: item.itemType }))
            : row.items,
        pendingSync: true,
    };
}

function invoiceMatchesFilters(row, params) {
    const status = (params.get('status') || '').toLowerCase();
    const start = params.get('start');
    const end = params.get('end');
    const q = (params.get('q') || '').trim().toLowerCase();
    if (status && status !== 'all' && row.status !== status) return false;
    if (start && String(row.date) < start) return false;
    if (end && String(row.date) > end) return false;
    if (q && !`${row.invoiceNumber} ${row.patient}`.toLowerCase().includes(q)) return false;
    return true;
}

function overlayInvoiceList(data, params) {
    const pending = pendingForContext().filter((item) => item.kind === 'invoice' && item.status === 'pending');
    if (pending.length === 0) return data;
    const rows = Array.isArray(data?.invoices) ? [...data.invoices] : [];
    const indexById = new Map(rows.map((row, index) => [row.id, index]));

    pending.forEach((entry) => {
        const body = entry.body || {};
        const index = indexById.get(entry.recordId);
        if (entry.action === 'create') {
            if (index !== undefined) return;
            const base = { id: entry.recordId, organizationId: null, clinicId: entry.clinicId, paidAmount: 0 };
            const row = applyInvoicePayloadToRow(base, body);
            if (invoiceMatchesFilters(row, params)) {
                indexById.set(row.id, rows.length);
                rows.push(row);
            }
            return;
        }
        if (index === undefined) return;
        if (entry.action === 'update') {
            rows[index] = applyInvoicePayloadToRow(rows[index], body);
        } else if (entry.action === 'status' && body.status === 'paid') {
            rows[index] = { ...rows[index], status: 'paid', paidAmount: rows[index].amount, outstandingAmount: 0, pendingSync: true };
        }
    });

    rows.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return { ...data, invoices: rows };
}

function overlayInvoiceDetail(data, invoiceId) {
    const pending = pendingForContext().filter(
        (item) => item.kind === 'invoice' && item.status === 'pending' && item.recordId === invoiceId
    );
    if (pending.length === 0) return data;
    let invoice = data?.invoice ? { ...data.invoice } : null;
    pending.forEach((entry) => {
        const body = entry.body || {};
        if (entry.action === 'create' || entry.action === 'update') {
            invoice = {
                ...(invoice || { id: invoiceId, clinicId: entry.clinicId, createdAt: entry.createdAt, notes: '' }),
                invoiceNumber: body.invoiceNumber || invoice?.invoiceNumber || '',
                patientId: body.patientId ?? invoice?.patientId ?? null,
                patientName: body.patientName || invoice?.patientName || '',
                patientContact: body.patientContact ?? invoice?.patientContact ?? '',
                date: body.date || invoice?.date || '',
                status: body.status || invoice?.status || 'pending',
                subtotal: Number(body.subtotal ?? invoice?.subtotal ?? 0),
                tax: Number(body.tax ?? invoice?.tax ?? 0),
                discount: Number(body.discount ?? invoice?.discount ?? 0),
                total: Number(body.total ?? invoice?.total ?? 0),
                items: invoiceItemsFromPayload(body),
                payments: paymentsFromPayload(body),
                pendingSync: true,
            };
        } else if (entry.action === 'status' && invoice && body.status === 'paid') {
            invoice = {
                ...invoice,
                status: 'paid',
                payments: [
                    ...(invoice.payments || []),
                    ...(Array.isArray(body.payments) && body.payments.length > 0
                        ? body.payments.map((p) => ({ id: newId(), amount: Number(p.amount || 0), date: invoice.date, method: p.method || 'cash', notes: 'Saved offline' }))
                        : [{ id: newId(), amount: Number(body.paymentAmount ?? invoice.total ?? 0), date: invoice.date, method: body.method || body.paymentMethod || 'cash', notes: 'Saved offline' }]),
                ],
                pendingSync: true,
            };
        }
    });
    return invoice ? { ...data, invoice } : data;
}

function toAppointmentRow(entry, base = {}) {
    const body = entry.body || {};
    return {
        ...base,
        id: entry.recordId,
        clinicId: base.clinicId || entry.clinicId,
        patientId: body.patientId ?? base.patientId ?? null,
        patient: body.patientName || base.patient || '',
        type: body.type ?? base.type ?? '',
        doctor: body.doctor ?? base.doctor ?? '',
        date: body.date || base.date || '',
        time: body.time ?? base.time ?? '',
        status: body.status || base.status || 'scheduled',
        notes: body.notes ?? base.notes ?? '',
        pendingSync: true,
    };
}

function appointmentMatchesFilters(row, params) {
    const date = params.get('date');
    const start = params.get('start');
    const end = params.get('end');
    const patientId = params.get('patientId');
    if (date && row.date !== date) return false;
    if (start && String(row.date) < start) return false;
    if (end && String(row.date) > end) return false;
    if (patientId && row.patientId !== patientId) return false;
    return true;
}

function overlayAppointmentList(data, params) {
    const pending = pendingForContext().filter((item) => item.kind === 'appointment' && item.status === 'pending');
    if (pending.length === 0) return data;
    const rows = Array.isArray(data?.appointments) ? [...data.appointments] : [];
    const indexById = new Map(rows.map((row, index) => [row.id, index]));

    pending.forEach((entry) => {
        const index = indexById.get(entry.recordId);
        if (entry.action === 'create') {
            if (index !== undefined) return;
            const row = toAppointmentRow(entry);
            if (appointmentMatchesFilters(row, params)) {
                indexById.set(row.id, rows.length);
                rows.push(row);
            }
            return;
        }
        if (index === undefined) return;
        if (entry.action === 'status') {
            rows[index] = { ...rows[index], status: entry.body?.status || rows[index].status, pendingSync: true };
        } else {
            rows[index] = toAppointmentRow(entry, rows[index]);
        }
    });

    rows.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    return { ...data, appointments: rows };
}

export function overlayPending(path, data) {
    const { pathname, params } = splitPath(path);
    try {
        if (pathname === '/invoices') return overlayInvoiceList(data, params);
        const detail = pathname.match(/^\/invoices\/([^/]+)$/);
        if (detail) return overlayInvoiceDetail(data, decodeURIComponent(detail[1]));
        if (pathname === '/appointments') return overlayAppointmentList(data, params);
    } catch {
        // Never let the overlay break a screen.
    }
    return data;
}

// ─── Sync engine ─────────────────────────────────────────────────────────────

function isRetryableFailure(error) {
    const status = Number(error?.status || 0);
    return !status || status >= 500 || status === 408 || status === 429;
}

export async function syncNow() {
    if (syncing || !sender) return;
    const { userId } = getContext();
    if (!userId) return;
    if (!readQueue().some((item) => item.userId === userId && item.status === 'pending')) return;

    syncing = true;
    emitChange();
    let syncedAny = false;
    try {
        // Process strictly in order; stop at the first retryable failure so
        // later edits never overtake the create they depend on.
        for (;;) {
            const next = readQueue().find((item) => item.userId === userId && item.status === 'pending');
            if (!next) break;
            try {
                await sender(next.path, {
                    method: next.method,
                    body: JSON.stringify(next.body || {}),
                    headers: next.clinicId ? { 'X-Clinic-Id': next.clinicId } : {},
                });
                writeQueue(readQueue().filter((item) => item.qid !== next.qid));
                syncedAny = true;
                lastSyncError = '';
            } catch (error) {
                if (isRetryableFailure(error) || Number(error?.status) === 401) {
                    lastSyncError = error?.message || 'Server not reachable.';
                    break;
                }
                // Permanent rejection (validation, stock, permissions): park it
                // so the user can see why and discard it, and keep going.
                writeQueue(readQueue().map((item) => (
                    item.qid === next.qid ? { ...item, status: 'failed', error: error?.message || 'Rejected by server.' } : item
                )));
            }
        }
    } finally {
        syncing = false;
        emitChange();
        if (syncedAny && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(`${OFFLINE_EVENT}:synced`));
        }
    }
}

let soonTimer = null;
function scheduleSoonSync() {
    if (soonTimer) clearTimeout(soonTimer);
    soonTimer = setTimeout(() => {
        soonTimer = null;
        syncNow();
    }, 15 * 1000);
}

export function configureOffline({ send, context }) {
    sender = send;
    if (context) getContext = context;
    if (started || typeof window === 'undefined') return;
    started = true;
    window.addEventListener('online', () => syncNow());
    window.addEventListener('offline', emitChange);
    setInterval(() => syncNow(), SYNC_INTERVAL_MS);
    setTimeout(() => syncNow(), 3000);
}
