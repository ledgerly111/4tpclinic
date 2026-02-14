const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const INVOICE_STATUSES = new Set(['pending', 'paid', 'overdue', 'void']);

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

function toCents(value) {
    const parsed = Number(value || 0);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.round(parsed * 100));
}

function fromCents(value) {
    return Number(((Number(value) || 0) / 100).toFixed(2));
}

function sanitizeDate(value) {
    if (!value) return new Date().toISOString().split('T')[0];
    return String(value).split('T')[0];
}

function normalizeInvoiceStatus(status) {
    const normalized = String(status || 'pending').toLowerCase();
    if (!INVOICE_STATUSES.has(normalized)) {
        throw new HttpError(400, 'Invalid invoice status.');
    }
    return normalized;
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: JSON_HEADERS,
    });
}

function emptyResponse(status = 204) {
    return new Response(null, {
        status,
        headers: JSON_HEADERS,
    });
}

function generateInvoiceNumber() {
    const suffix = Math.floor(Math.random() * 90000) + 10000;
    return `INV-${Date.now()}-${suffix}`;
}

function mapInvoiceRow(row) {
    return {
        id: row.id,
        invoiceNumber: row.invoice_number,
        patient: row.patient_name,
        patientContact: row.patient_contact || '',
        date: row.invoice_date,
        amount: fromCents(row.total_cents),
        status: row.status,
        service: row.service_names || '',
        paidAmount: fromCents(row.paid_cents),
        outstandingAmount: fromCents(row.outstanding_cents),
    };
}

async function parseJsonRequest(request) {
    try {
        return await request.json();
    } catch {
        throw new HttpError(400, 'Request body must be valid JSON.');
    }
}

async function listInvoices(env, url) {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const status = (url.searchParams.get('status') || '').trim().toLowerCase();

    let sql = `
        SELECT
            i.id,
            i.invoice_number,
            i.patient_name,
            i.patient_contact,
            i.invoice_date,
            i.status,
            i.total_cents,
            COALESCE((
                SELECT SUM(p.amount_cents)
                FROM payments p
                WHERE p.invoice_id = i.id
            ), 0) AS paid_cents,
            CASE
                WHEN i.total_cents - COALESCE((
                    SELECT SUM(p.amount_cents)
                    FROM payments p
                    WHERE p.invoice_id = i.id
                ), 0) > 0
                THEN i.total_cents - COALESCE((
                    SELECT SUM(p.amount_cents)
                    FROM payments p
                    WHERE p.invoice_id = i.id
                ), 0)
                ELSE 0
            END AS outstanding_cents,
            COALESCE((
                SELECT GROUP_CONCAT(ii.item_name, ', ')
                FROM invoice_items ii
                WHERE ii.invoice_id = i.id
            ), '') AS service_names
        FROM invoices i
        WHERE 1 = 1
    `;

    const bindings = [];

    if (status && status !== 'all') {
        if (!INVOICE_STATUSES.has(status)) {
            throw new HttpError(400, 'Invalid status filter.');
        }
        sql += ' AND i.status = ?';
        bindings.push(status);
    }

    if (q) {
        sql += ' AND (LOWER(i.invoice_number) LIKE ? OR LOWER(i.patient_name) LIKE ?)';
        bindings.push(`%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY i.invoice_date DESC, i.created_at DESC';

    const statement = env.DB.prepare(sql);
    const result = bindings.length > 0
        ? await statement.bind(...bindings).all()
        : await statement.all();

    return jsonResponse({
        invoices: (result.results || []).map(mapInvoiceRow),
    });
}

async function createInvoice(env, request) {
    const body = await parseJsonRequest(request);

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
        throw new HttpError(400, 'Invoice must contain at least one item.');
    }

    const normalizedItems = items.map((item) => {
        const name = String(item.name || '').trim();
        const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
        const unitPriceCents = toCents(item.price);

        if (!name) {
            throw new HttpError(400, 'Each invoice item must include a name.');
        }

        return {
            id: crypto.randomUUID(),
            name,
            quantity,
            unitPriceCents,
            lineTotalCents: quantity * unitPriceCents,
        };
    });

    const patientName = String(body.patientName || '').trim();
    if (!patientName) {
        throw new HttpError(400, 'Patient name is required.');
    }

    const status = normalizeInvoiceStatus(body.status || 'pending');
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = String(body.invoiceNumber || generateInvoiceNumber()).trim();
    const invoiceDate = sanitizeDate(body.date);
    const subtotalCents = normalizedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const taxCents = toCents(body.tax);
    const discountCents = toCents(body.discount);
    const totalCents = Math.max(0, subtotalCents + taxCents - discountCents);

    const statements = [
        env.DB
            .prepare(`
                INSERT INTO invoices (
                    id,
                    invoice_number,
                    patient_id,
                    patient_name,
                    patient_contact,
                    invoice_date,
                    status,
                    subtotal_cents,
                    tax_cents,
                    discount_cents,
                    total_cents,
                    currency,
                    notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                invoiceId,
                invoiceNumber,
                body.patientId ? String(body.patientId) : null,
                patientName,
                body.patientContact ? String(body.patientContact) : null,
                invoiceDate,
                status,
                subtotalCents,
                taxCents,
                discountCents,
                totalCents,
                'USD',
                body.notes ? String(body.notes) : null
            ),
    ];

    normalizedItems.forEach((item) => {
        statements.push(
            env.DB
                .prepare(`
                    INSERT INTO invoice_items (
                        id,
                        invoice_id,
                        item_name,
                        unit_price_cents,
                        quantity,
                        line_total_cents
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    item.id,
                    invoiceId,
                    item.name,
                    item.unitPriceCents,
                    item.quantity,
                    item.lineTotalCents
                )
        );
    });

    if (status === 'paid' && totalCents > 0) {
        statements.push(
            env.DB
                .prepare(`
                    INSERT INTO payments (
                        id,
                        invoice_id,
                        amount_cents,
                        payment_date,
                        method,
                        notes
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    crypto.randomUUID(),
                    invoiceId,
                    totalCents,
                    invoiceDate,
                    'manual',
                    'Auto-created from paid invoice status.'
                )
        );
    }

    try {
        await env.DB.batch(statements);
    } catch (error) {
        const message = String(error.message || '');
        if (message.includes('UNIQUE constraint failed: invoices.invoice_number')) {
            throw new HttpError(409, 'Invoice number already exists.');
        }
        throw error;
    }

    return jsonResponse({
        invoice: {
            id: invoiceId,
            invoiceNumber,
            date: invoiceDate,
            patient: patientName,
            amount: fromCents(totalCents),
            status,
        },
    }, 201);
}

async function updateInvoiceStatus(env, request, invoiceId) {
    const body = await parseJsonRequest(request);
    const status = normalizeInvoiceStatus(body.status);

    const invoice = await env.DB
        .prepare(`
            SELECT
                id,
                invoice_date,
                total_cents,
                status
            FROM invoices
            WHERE id = ?
        `)
        .bind(invoiceId)
        .first();

    if (!invoice) {
        throw new HttpError(404, 'Invoice not found.');
    }

    const statements = [
        env.DB
            .prepare(`
                UPDATE invoices
                SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
            `)
            .bind(status, invoiceId),
    ];

    if (status === 'paid') {
        const paid = await env.DB
            .prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total FROM payments WHERE invoice_id = ?')
            .bind(invoiceId)
            .first();
        const outstanding = Math.max(0, Number(invoice.total_cents || 0) - Number(paid.total || 0));

        if (outstanding > 0) {
            statements.push(
                env.DB
                    .prepare(`
                        INSERT INTO payments (
                            id,
                            invoice_id,
                            amount_cents,
                            payment_date,
                            method,
                            notes
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `)
                    .bind(
                        crypto.randomUUID(),
                        invoiceId,
                        outstanding,
                        sanitizeDate(body.paymentDate || invoice.invoice_date),
                        body.method ? String(body.method) : 'manual',
                        body.notes ? String(body.notes) : 'Recorded from invoice status change.'
                    )
            );
        }
    }

    await env.DB.batch(statements);
    return jsonResponse({ ok: true });
}

async function getAccountingSummary(env) {
    const invoicesResult = await env.DB
        .prepare(`
            SELECT
                i.id,
                i.status,
                i.total_cents,
                COALESCE((
                    SELECT SUM(p.amount_cents)
                    FROM payments p
                    WHERE p.invoice_id = i.id
                ), 0) AS paid_cents
            FROM invoices i
            WHERE i.status != 'void'
        `)
        .all();

    const payments = await env.DB
        .prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total FROM payments')
        .first();

    let pendingAmountCents = 0;
    let overdueAmountCents = 0;
    let receivableAmountCents = 0;

    (invoicesResult.results || []).forEach((invoice) => {
        const outstanding = Math.max(0, Number(invoice.total_cents || 0) - Number(invoice.paid_cents || 0));
        receivableAmountCents += outstanding;
        if (invoice.status === 'pending') pendingAmountCents += outstanding;
        if (invoice.status === 'overdue') overdueAmountCents += outstanding;
    });

    return jsonResponse({
        cashReceived: fromCents(payments.total),
        pendingAmount: fromCents(pendingAmountCents),
        overdueAmount: fromCents(overdueAmountCents),
        receivables: fromCents(receivableAmountCents),
        invoiceCount: (invoicesResult.results || []).length,
    });
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return emptyResponse();
        }

        try {
            const url = new URL(request.url);
            const { pathname } = url;

            if (pathname === '/health' && request.method === 'GET') {
                return jsonResponse({
                    ok: true,
                    timestamp: new Date().toISOString(),
                });
            }

            if (pathname === '/api/invoices' && request.method === 'GET') {
                return listInvoices(env, url);
            }

            if (pathname === '/api/invoices' && request.method === 'POST') {
                return createInvoice(env, request);
            }

            const statusMatch = pathname.match(/^\/api\/invoices\/([^/]+)\/status$/);
            if (statusMatch && request.method === 'PATCH') {
                return updateInvoiceStatus(env, request, decodeURIComponent(statusMatch[1]));
            }

            if (pathname === '/api/accounting/summary' && request.method === 'GET') {
                return getAccountingSummary(env);
            }

            return jsonResponse({ error: 'Not found.' }, 404);
        } catch (error) {
            if (error instanceof HttpError) {
                return jsonResponse({ error: error.message }, error.status);
            }

            return jsonResponse({
                error: 'Internal server error.',
                detail: String(error.message || error),
            }, 500);
        }
    },
};
