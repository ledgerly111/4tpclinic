const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Clinic-Id',
};

const INVOICE_STATUSES = new Set(['pending', 'paid', 'overdue', 'void']);
const APPOINTMENT_STATUSES = new Set(['scheduled', 'in-progress', 'completed', 'cancelled']);
const SUPER_ADMIN_DEFAULT = {
    username: 'aadhila003@gmail.com',
    email: 'aadhila003@gmail.com',
    password: 'aadhil8089385071',
    fullName: 'Aadhila Super Admin',
};

const SCHEMA_STATEMENTS = [
    'PRAGMA foreign_keys = ON',
    `CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        admin_user_id TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )`,
    `CREATE TABLE IF NOT EXISTS clinics (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff')),
        organization_id TEXT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS user_clinics (
        user_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        PRIMARY KEY (user_id, clinic_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        expires_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        clinic_id TEXT,
        invoice_number TEXT NOT NULL UNIQUE,
        patient_id TEXT,
        patient_name TEXT NOT NULL,
        patient_contact TEXT,
        invoice_date TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'void')),
        subtotal_cents INTEGER NOT NULL DEFAULT 0,
        tax_cents INTEGER NOT NULL DEFAULT 0,
        discount_cents INTEGER NOT NULL DEFAULT 0,
        total_cents INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'USD',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        unit_price_cents INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        line_total_cents INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        payment_date TEXT NOT NULL,
        method TEXT NOT NULL DEFAULT 'manual',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        contact TEXT,
        medical_history TEXT,
        last_visit TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price_cents INTEGER NOT NULL DEFAULT 0,
        duration_minutes INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        reorder_threshold INTEGER NOT NULL DEFAULT 0,
        cost_price_cents INTEGER NOT NULL DEFAULT 0,
        sell_price_cents INTEGER NOT NULL DEFAULT 0,
        expiry_date TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_transactions (
        id TEXT PRIMARY KEY,
        inventory_item_id TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment')),
        quantity INTEGER NOT NULL,
        unit_cost_cents INTEGER NOT NULL DEFAULT 0,
        reference_type TEXT,
        reference_id TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        patient_id TEXT,
        patient_name TEXT NOT NULL,
        type TEXT NOT NULL,
        doctor TEXT,
        scheduled_date TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    )`,
    'CREATE INDEX IF NOT EXISTS idx_clinics_org_id ON clinics(organization_id)',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_org_code_unique ON clinics(organization_id, code)',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower_unique ON users(LOWER(username))',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique ON users(LOWER(email))',
    'CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_clinics_user_id ON user_clinics(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_clinics_clinic_id ON user_clinics(clinic_id)',
    'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date)',
    'CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)',
    'CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id)',
    'CREATE INDEX IF NOT EXISTS idx_patients_org_id ON patients(organization_id)',
    'CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id)',
    'CREATE INDEX IF NOT EXISTS idx_services_org_id ON services(organization_id)',
    'CREATE INDEX IF NOT EXISTS idx_services_clinic_id ON services(clinic_id)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_org_id ON inventory_items(organization_id)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_clinic_id ON inventory_items(clinic_id)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_tx_item_id ON inventory_transactions(inventory_item_id)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_org_id ON appointments(organization_id)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date)',
];

let schemaReady = false;

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

function extractErrorMessage(error) {
    try {
        if (!error) return '';
        if (typeof error === 'string') return error;
        if (typeof error.message === 'string') return error.message;
        const json = JSON.stringify(error);
        return typeof json === 'string' ? json : '';
    } catch {
        return '';
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

function sanitizeOptionalDate(value) {
    if (value === undefined || value === null) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    return raw.split('T')[0];
}

function getExpiryMeta(expiryDate) {
    if (!expiryDate) {
        return { expiryStatus: 'not_set', daysToExpiry: null };
    }

    const now = new Date();
    const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const [year, month, day] = String(expiryDate).split('-').map((value) => Number.parseInt(value, 10));
    if (!year || !month || !day) {
        return { expiryStatus: 'not_set', daysToExpiry: null };
    }

    const expiryUtc = Date.UTC(year, month - 1, day);
    const daysToExpiry = Math.floor((expiryUtc - nowUtc) / 86400000);

    if (daysToExpiry < 0) return { expiryStatus: 'expired', daysToExpiry };
    if (daysToExpiry <= 30) return { expiryStatus: 'expiring_soon', daysToExpiry };
    return { expiryStatus: 'good', daysToExpiry };
}

function normalizeInvoiceStatus(status) {
    const normalized = String(status || 'pending').toLowerCase();
    if (!INVOICE_STATUSES.has(normalized)) {
        throw new HttpError(400, 'Invalid invoice status.');
    }
    return normalized;
}

function normalizeAppointmentStatus(status) {
    const normalized = String(status || 'scheduled').toLowerCase();
    if (!APPOINTMENT_STATUSES.has(normalized)) {
        throw new HttpError(400, 'Invalid appointment status.');
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

function requireDb(env) {
    if (!env.DB) {
        throw new HttpError(500, 'D1 binding "DB" is missing. Check wrangler.toml.');
    }
    return env.DB;
}

async function parseJsonRequest(request) {
    try {
        return await request.json();
    } catch {
        throw new HttpError(400, 'Request body must be valid JSON.');
    }
}

async function ensureInvoicesTenantColumns(db) {
    const tableInfo = await db.prepare('PRAGMA table_info(invoices)').all();
    const names = new Set((tableInfo.results || []).map((c) => c.name));

    if (!names.has('organization_id')) {
        await db.prepare('ALTER TABLE invoices ADD COLUMN organization_id TEXT').run();
    }
    if (!names.has('clinic_id')) {
        await db.prepare('ALTER TABLE invoices ADD COLUMN clinic_id TEXT').run();
    }

    await db.prepare('CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(organization_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id ON invoices(clinic_id)').run();
}

async function ensureInvoiceItemColumns(db) {
    const tableInfo = await db.prepare('PRAGMA table_info(invoice_items)').all();
    const names = new Set((tableInfo.results || []).map((c) => c.name));

    if (!names.has('item_type')) {
        await db.prepare('ALTER TABLE invoice_items ADD COLUMN item_type TEXT').run();
    }
    if (!names.has('inventory_item_id')) {
        await db.prepare('ALTER TABLE invoice_items ADD COLUMN inventory_item_id TEXT').run();
    }
}

async function ensureInventoryColumns(db) {
    const tableInfo = await db.prepare('PRAGMA table_info(inventory_items)').all();
    const names = new Set((tableInfo.results || []).map((c) => c.name));
    if (!names.has('expiry_date')) {
        await db.prepare('ALTER TABLE inventory_items ADD COLUMN expiry_date TEXT').run();
    }
}

async function ensureSuperAdminUser(db) {
    const existing = await db
        .prepare('SELECT id FROM users WHERE role = ? LIMIT 1')
        .bind('super_admin')
        .first();

    if (existing) return;

    await db
        .prepare(`
            INSERT INTO users (
                id,
                role,
                organization_id,
                username,
                email,
                password,
                full_name,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
            crypto.randomUUID(),
            'super_admin',
            null,
            SUPER_ADMIN_DEFAULT.username,
            SUPER_ADMIN_DEFAULT.email,
            SUPER_ADMIN_DEFAULT.password,
            SUPER_ADMIN_DEFAULT.fullName,
            1
        )
        .run();
}

async function ensureSchema(env) {
    if (schemaReady) return;
    const db = requireDb(env);
    await db.batch(SCHEMA_STATEMENTS.map((statement) => db.prepare(statement)));
    await ensureInvoicesTenantColumns(db);
    await ensureInvoiceItemColumns(db);
    await ensureInventoryColumns(db);
    await ensureSuperAdminUser(db);
    schemaReady = true;
}

function mapSessionUser(baseUser, clinicIds) {
    return {
        userId: baseUser.id,
        role: baseUser.role,
        organizationId: baseUser.organization_id || null,
        clinicIds,
        fullName: baseUser.full_name,
        email: baseUser.email,
    };
}

async function getClinicIdsForUser(db, userId) {
    const result = await db
        .prepare('SELECT clinic_id FROM user_clinics WHERE user_id = ? ORDER BY clinic_id')
        .bind(userId)
        .all();
    return (result.results || []).map((row) => row.clinic_id);
}

async function getUserByToken(db, token) {
    if (!token) return null;

    const row = await db
        .prepare(`
            SELECT
                u.id,
                u.role,
                u.organization_id,
                u.username,
                u.email,
                u.password,
                u.full_name,
                u.is_active
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ?
            LIMIT 1
        `)
        .bind(token)
        .first();

    if (!row || !row.is_active) return null;

    const clinicIds = await getClinicIdsForUser(db, row.id);
    return {
        ...mapSessionUser(row, clinicIds),
        username: row.username,
        password: row.password,
    };
}

function getBearerToken(request) {
    const header = request.headers.get('Authorization') || '';
    if (!header.startsWith('Bearer ')) return '';
    return header.slice(7).trim();
}

async function requireAuth(request, env) {
    const token = getBearerToken(request);
    if (!token) throw new HttpError(401, 'Missing authorization token.');

    const db = requireDb(env);
    const user = await getUserByToken(db, token);
    if (!user) throw new HttpError(401, 'Invalid or expired session.');

    return { token, user };
}

function requireRoles(user, roles) {
    if (!roles.includes(user.role)) {
        throw new HttpError(403, 'You do not have permission for this action.');
    }
}

async function assertUniqueIdentity(db, username, email) {
    const normalizedUsername = String(username || '').trim().toLowerCase();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedUsername || !normalizedEmail) {
        throw new HttpError(400, 'Username and email are required.');
    }

    const existing = await db
        .prepare('SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1')
        .bind(normalizedUsername, normalizedEmail)
        .first();
    if (existing) throw new HttpError(409, 'Username or email already exists.');
}

async function getAccessibleClinicIds(db, sessionUser) {
    if (sessionUser.role === 'super_admin') {
        const all = await db.prepare('SELECT id FROM clinics').all();
        return (all.results || []).map((row) => row.id);
    }
    if (sessionUser.role === 'admin') {
        const orgClinics = await db
            .prepare('SELECT id FROM clinics WHERE organization_id = ? ORDER BY created_at')
            .bind(sessionUser.organizationId)
            .all();
        return (orgClinics.results || []).map((row) => row.id);
    }
    return sessionUser.clinicIds || [];
}

async function resolveActiveClinicId(db, request, sessionUser, required = false) {
    const requestedClinicId = (request.headers.get('X-Clinic-Id') || '').trim();
    const accessibleClinicIds = await getAccessibleClinicIds(db, sessionUser);

    if (requestedClinicId) {
        if (!accessibleClinicIds.includes(requestedClinicId)) {
            if (!required) {
                // Ignore stale clinic selection for read/filter endpoints.
                return null;
            }
            throw new HttpError(403, 'Selected clinic is not accessible.');
        }
        return requestedClinicId;
    }

    if (!required) return null;
    if (accessibleClinicIds.length === 1) return accessibleClinicIds[0];
    throw new HttpError(400, 'Select a clinic before continuing.');
}

async function resolveUniqueInvoiceNumber(db, requestedNumber) {
    const explicit = String(requestedNumber || '').trim();
    const base = explicit || `INV-${Date.now()}-${Math.floor(Math.random() * 90000) + 10000}`;

    for (let attempt = 0; attempt < 8; attempt += 1) {
        const candidate = attempt === 0
            ? base
            : `${base}-${Math.floor(100 + Math.random() * 900)}`;
        const existing = await db
            .prepare('SELECT id FROM invoices WHERE invoice_number = ? LIMIT 1')
            .bind(candidate)
            .first();
        if (!existing) return candidate;
    }

    throw new HttpError(409, explicit ? 'Invoice number already exists.' : 'Could not generate a unique invoice number.');
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
        organizationId: row.organization_id || null,
        clinicId: row.clinic_id || null,
    };
}
async function login(env, request) {
    const db = requireDb(env);
    const body = await parseJsonRequest(request);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password) {
        throw new HttpError(400, 'Username/email and password are required.');
    }

    const user = await db
        .prepare(`
            SELECT
                id,
                role,
                organization_id,
                username,
                email,
                password,
                full_name,
                is_active
            FROM users
            WHERE (LOWER(username) = ? OR LOWER(email) = ?)
            AND password = ?
            LIMIT 1
        `)
        .bind(username.toLowerCase(), username.toLowerCase(), password)
        .first();

    if (!user || !user.is_active) throw new HttpError(401, 'Invalid credentials.');

    const clinicIds = await getClinicIdsForUser(db, user.id);
    const token = crypto.randomUUID();

    await db
        .prepare('INSERT INTO sessions (id, token, user_id) VALUES (?, ?, ?)')
        .bind(crypto.randomUUID(), token, user.id)
        .run();

    return jsonResponse({
        token,
        user: {
            ...mapSessionUser(user, clinicIds),
            loginAt: new Date().toISOString(),
        },
    });
}

async function getSession(env, request) {
    const { user } = await requireAuth(request, env);
    return jsonResponse({ user });
}

async function logout(env, request) {
    const { token } = await requireAuth(request, env);
    const db = requireDb(env);
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return jsonResponse({ ok: true });
}

async function getTenantBootstrap(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);

    let organizations = [];
    let clinics = [];

    if (user.role === 'super_admin') {
        const orgResult = await db.prepare('SELECT id, name, admin_user_id, created_at FROM organizations ORDER BY created_at DESC').all();
        const clinicResult = await db.prepare('SELECT id, organization_id, name, code, created_at FROM clinics ORDER BY created_at DESC').all();
        organizations = (orgResult.results || []).map((row) => ({
            id: row.id,
            name: row.name,
            adminUserId: row.admin_user_id || null,
            createdAt: row.created_at,
        }));
        clinics = (clinicResult.results || []).map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            code: row.code,
            createdAt: row.created_at,
        }));
    } else {
        const orgResult = await db
            .prepare('SELECT id, name, admin_user_id, created_at FROM organizations WHERE id = ? LIMIT 1')
            .bind(user.organizationId)
            .all();
        organizations = (orgResult.results || []).map((row) => ({
            id: row.id,
            name: row.name,
            adminUserId: row.admin_user_id || null,
            createdAt: row.created_at,
        }));

        if (user.role === 'admin') {
            const clinicResult = await db
                .prepare('SELECT id, organization_id, name, code, created_at FROM clinics WHERE organization_id = ? ORDER BY created_at DESC')
                .bind(user.organizationId)
                .all();
            clinics = (clinicResult.results || []).map((row) => ({
                id: row.id,
                organizationId: row.organization_id,
                name: row.name,
                code: row.code,
                createdAt: row.created_at,
            }));
        } else {
            const clinicResult = await db
                .prepare(`
                    SELECT c.id, c.organization_id, c.name, c.code, c.created_at
                    FROM clinics c
                    JOIN user_clinics uc ON uc.clinic_id = c.id
                    WHERE uc.user_id = ?
                    ORDER BY c.created_at DESC
                `)
                .bind(user.userId)
                .all();
            clinics = (clinicResult.results || []).map((row) => ({
                id: row.id,
                organizationId: row.organization_id,
                name: row.name,
                code: row.code,
                createdAt: row.created_at,
            }));
        }
    }

    return jsonResponse({ organizations, clinics });
}

async function getSuperAdminOverview(env, request) {
    const { user } = await requireAuth(request, env);
    requireRoles(user, ['super_admin']);
    const db = requireDb(env);

    const orgs = await db
        .prepare('SELECT id, name, admin_user_id, created_at FROM organizations ORDER BY created_at DESC')
        .all();
    const clinics = await db
        .prepare('SELECT id, organization_id, name, code, created_at FROM clinics ORDER BY created_at DESC')
        .all();
    const users = await db
        .prepare(`
            SELECT
                id,
                role,
                organization_id,
                username,
                email,
                password,
                full_name,
                is_active,
                created_at
            FROM users
            ORDER BY created_at DESC
        `)
        .all();

    const userRows = users.results || [];
    const clinicAssignments = new Map();

    if (userRows.length > 0) {
        const userIds = userRows.map((row) => row.id);
        const placeholders = userIds.map(() => '?').join(',');
        const assignments = await db
            .prepare(`SELECT user_id, clinic_id FROM user_clinics WHERE user_id IN (${placeholders})`)
            .bind(...userIds)
            .all();

        (assignments.results || []).forEach((row) => {
            const current = clinicAssignments.get(row.user_id) || [];
            current.push(row.clinic_id);
            clinicAssignments.set(row.user_id, current);
        });
    }

    return jsonResponse({
        organizations: (orgs.results || []).map((row) => ({
            id: row.id,
            name: row.name,
            adminUserId: row.admin_user_id || null,
            createdAt: row.created_at,
        })),
        clinics: (clinics.results || []).map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            code: row.code,
            createdAt: row.created_at,
        })),
        users: userRows.map((row) => ({
            id: row.id,
            role: row.role,
            organizationId: row.organization_id || null,
            clinicIds: clinicAssignments.get(row.id) || [],
            username: row.username,
            email: row.email,
            password: row.password,
            fullName: row.full_name,
            isActive: Boolean(row.is_active),
            createdAt: row.created_at,
        })),
    });
}
async function createOrganizationWithAdmin(env, request) {
    const { user } = await requireAuth(request, env);
    requireRoles(user, ['super_admin']);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const orgName = String(body.orgName || '').trim();
    const adminFullName = String(body.adminFullName || '').trim();
    const adminUsername = String(body.adminUsername || '').trim();
    const adminEmail = String(body.adminEmail || '').trim();
    const adminPassword = String(body.adminPassword || '');

    if (!orgName || !adminFullName || !adminUsername || !adminEmail || !adminPassword) {
        throw new HttpError(400, 'Organization and admin fields are required.');
    }

    await assertUniqueIdentity(db, adminUsername, adminEmail);

    const organizationId = crypto.randomUUID();
    const adminUserId = crypto.randomUUID();

    await db.batch([
        db.prepare('INSERT INTO organizations (id, name, admin_user_id) VALUES (?, ?, ?)').bind(organizationId, orgName, adminUserId),
        db.prepare(`
            INSERT INTO users (
                id,
                role,
                organization_id,
                username,
                email,
                password,
                full_name,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(adminUserId, 'admin', organizationId, adminUsername, adminEmail, adminPassword, adminFullName, 1),
    ]);

    return jsonResponse({
        organization: {
            id: organizationId,
            name: orgName,
            adminUserId,
        },
        admin: {
            id: adminUserId,
            role: 'admin',
            organizationId,
            clinicIds: [],
            username: adminUsername,
            email: adminEmail,
            password: adminPassword,
            fullName: adminFullName,
            isActive: true,
        },
    }, 201);
}

async function createAdminForOrganization(env, request) {
    const { user } = await requireAuth(request, env);
    requireRoles(user, ['super_admin']);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const organizationId = String(body.organizationId || '').trim();
    const adminFullName = String(body.adminFullName || '').trim();
    const adminUsername = String(body.adminUsername || '').trim();
    const adminEmail = String(body.adminEmail || '').trim();
    const adminPassword = String(body.adminPassword || '');

    if (!organizationId || !adminFullName || !adminUsername || !adminEmail || !adminPassword) {
        throw new HttpError(400, 'Organization and admin fields are required.');
    }

    const organization = await db
        .prepare('SELECT id FROM organizations WHERE id = ? LIMIT 1')
        .bind(organizationId)
        .first();
    if (!organization) throw new HttpError(404, 'Organization not found.');

    await assertUniqueIdentity(db, adminUsername, adminEmail);

    const adminUserId = crypto.randomUUID();
    await db
        .prepare(`
            INSERT INTO users (
                id,
                role,
                organization_id,
                username,
                email,
                password,
                full_name,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(adminUserId, 'admin', organizationId, adminUsername, adminEmail, adminPassword, adminFullName, 1)
        .run();

    return jsonResponse({
        admin: {
            id: adminUserId,
            role: 'admin',
            organizationId,
            clinicIds: [],
            username: adminUsername,
            email: adminEmail,
            password: adminPassword,
            fullName: adminFullName,
            isActive: true,
        },
    }, 201);
}

async function getAdminSupervision(env, request) {
    const { user } = await requireAuth(request, env);
    requireRoles(user, ['admin']);
    const db = requireDb(env);

    const clinics = await db
        .prepare('SELECT id, organization_id, name, code, created_at FROM clinics WHERE organization_id = ? ORDER BY created_at DESC')
        .bind(user.organizationId)
        .all();
    const staff = await db
        .prepare(`
            SELECT
                id,
                role,
                organization_id,
                username,
                email,
                password,
                full_name,
                is_active,
                created_at
            FROM users
            WHERE organization_id = ?
            AND role = 'staff'
            ORDER BY created_at DESC
        `)
        .bind(user.organizationId)
        .all();

    const staffRows = staff.results || [];
    const assignments = new Map();

    if (staffRows.length > 0) {
        const userIds = staffRows.map((row) => row.id);
        const placeholders = userIds.map(() => '?').join(',');
        const clinicAssignments = await db
            .prepare(`SELECT user_id, clinic_id FROM user_clinics WHERE user_id IN (${placeholders})`)
            .bind(...userIds)
            .all();

        (clinicAssignments.results || []).forEach((row) => {
            const current = assignments.get(row.user_id) || [];
            current.push(row.clinic_id);
            assignments.set(row.user_id, current);
        });
    }

    return jsonResponse({
        clinics: (clinics.results || []).map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            code: row.code,
            createdAt: row.created_at,
        })),
        users: staffRows.map((row) => ({
            id: row.id,
            role: row.role,
            organizationId: row.organization_id,
            clinicIds: assignments.get(row.id) || [],
            username: row.username,
            email: row.email,
            password: row.password,
            fullName: row.full_name,
            isActive: Boolean(row.is_active),
            createdAt: row.created_at,
        })),
    });
}

async function createClinic(env, request) {
    const { user } = await requireAuth(request, env);
    requireRoles(user, ['admin']);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const name = String(body.name || '').trim();
    const code = String(body.code || '').trim().toUpperCase();
    if (!name || !code) throw new HttpError(400, 'Clinic name and code are required.');

    const duplicate = await db
        .prepare('SELECT id FROM clinics WHERE organization_id = ? AND code = ? LIMIT 1')
        .bind(user.organizationId, code)
        .first();
    if (duplicate) throw new HttpError(409, 'Clinic code already exists in this organization.');

    const clinicId = crypto.randomUUID();
    await db
        .prepare('INSERT INTO clinics (id, organization_id, name, code) VALUES (?, ?, ?, ?)')
        .bind(clinicId, user.organizationId, name, code)
        .run();

    return jsonResponse({
        clinic: {
            id: clinicId,
            organizationId: user.organizationId,
            name,
            code,
            createdAt: new Date().toISOString(),
        },
    }, 201);
}
async function createStaff(env, request) {
    const { user } = await requireAuth(request, env);
    requireRoles(user, ['admin']);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const fullName = String(body.fullName || '').trim();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    const clinicIds = Array.isArray(body.clinicIds) ? body.clinicIds.map((id) => String(id).trim()).filter(Boolean) : [];

    if (!fullName || !username || !email || !password) {
        throw new HttpError(400, 'Staff details are required.');
    }
    if (clinicIds.length === 0) throw new HttpError(400, 'Assign at least one clinic.');

    const placeholders = clinicIds.map(() => '?').join(',');
    const clinicRows = await db
        .prepare(`
            SELECT id
            FROM clinics
            WHERE organization_id = ?
            AND id IN (${placeholders})
        `)
        .bind(user.organizationId, ...clinicIds)
        .all();

    const validClinicIds = (clinicRows.results || []).map((row) => row.id);
    if (validClinicIds.length !== clinicIds.length) {
        throw new HttpError(400, 'One or more selected clinics are invalid.');
    }

    await assertUniqueIdentity(db, username, email);

    const userId = crypto.randomUUID();
    const statements = [
        db.prepare(`
            INSERT INTO users (
                id,
                role,
                organization_id,
                username,
                email,
                password,
                full_name,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, 'staff', user.organizationId, username, email, password, fullName, 1),
    ];

    validClinicIds.forEach((clinicId) => {
        statements.push(
            db.prepare('INSERT INTO user_clinics (user_id, clinic_id) VALUES (?, ?)').bind(userId, clinicId)
        );
    });

    await db.batch(statements);

    return jsonResponse({
        user: {
            id: userId,
            role: 'staff',
            organizationId: user.organizationId,
            clinicIds: validClinicIds,
            username,
            email,
            password,
            fullName,
            isActive: true,
            createdAt: new Date().toISOString(),
        },
    }, 201);
}

async function resetUserPassword(env, request, targetUserId) {
    const { user } = await requireAuth(request, env);
    requireRoles(user, ['admin']);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const newPassword = String(body.newPassword || '');
    if (!newPassword) throw new HttpError(400, 'New password is required.');

    const targetUser = await db
        .prepare('SELECT id, role, organization_id FROM users WHERE id = ? LIMIT 1')
        .bind(targetUserId)
        .first();
    if (!targetUser) throw new HttpError(404, 'User not found.');

    if (targetUser.organization_id !== user.organizationId || targetUser.role !== 'staff') {
        throw new HttpError(403, 'You can only reset passwords for your staff users.');
    }

    await db
        .prepare('UPDATE users SET password = ? WHERE id = ?')
        .bind(newPassword, targetUserId)
        .run();

    return jsonResponse({ ok: true });
}

async function listPatients(env, request, url) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const activeClinicId = await resolveActiveClinicId(db, request, user, false);

    let sql = `
        SELECT id, organization_id, clinic_id, name, age, gender, contact, medical_history, last_visit, created_at
        FROM patients
        WHERE 1 = 1
    `;
    const bindings = [];

    if (user.role === 'admin' || user.role === 'staff') {
        sql += ' AND organization_id = ?';
        bindings.push(user.organizationId);
    }

    if (user.role === 'staff') {
        if (!user.clinicIds?.length) return jsonResponse({ patients: [] });
        const placeholders = user.clinicIds.map(() => '?').join(',');
        sql += ` AND clinic_id IN (${placeholders})`;
        bindings.push(...user.clinicIds);
    }

    if (activeClinicId) {
        sql += ' AND clinic_id = ?';
        bindings.push(activeClinicId);
    }

    if (q) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(contact) LIKE ?)';
        bindings.push(`%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const result = bindings.length > 0
        ? await db.prepare(sql).bind(...bindings).all()
        : await db.prepare(sql).all();

    return jsonResponse({
        patients: (result.results || []).map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            clinicId: row.clinic_id,
            name: row.name,
            age: row.age ?? '',
            gender: row.gender || '',
            contact: row.contact || '',
            medicalHistory: row.medical_history ? JSON.parse(row.medical_history) : [],
            lastVisit: row.last_visit || '',
            createdAt: row.created_at,
        })),
    });
}

async function createPatient(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const name = String(body.name || '').trim();
    if (!name) throw new HttpError(400, 'Patient name is required.');

    const headerClinicId = await resolveActiveClinicId(db, request, user, user.role !== 'super_admin');
    const bodyClinicId = user.role === 'super_admin' ? String(body.clinicId || '').trim() : '';
    const activeClinicId = headerClinicId || bodyClinicId;
    let organizationId = user.role === 'super_admin'
        ? String(body.organizationId || '').trim()
        : user.organizationId;

    if (activeClinicId) {
        const clinic = await db
            .prepare('SELECT id, organization_id FROM clinics WHERE id = ? LIMIT 1')
            .bind(activeClinicId)
            .first();

        if (!clinic) {
            throw new HttpError(400, 'Selected clinic does not exist.');
        }

        if (user.role === 'super_admin' && !organizationId) {
            organizationId = clinic.organization_id;
        }

        if (organizationId && clinic.organization_id !== organizationId) {
            throw new HttpError(400, 'Clinic does not belong to the selected organization.');
        }
    }

    if (!organizationId || !activeClinicId) {
        throw new HttpError(400, 'Organization and clinic are required.');
    }

    const id = crypto.randomUUID();
    const age = Number.parseInt(body.age, 10);
    const medicalHistory = Array.isArray(body.medicalHistory)
        ? body.medicalHistory.map((item) => String(item || '').trim()).filter(Boolean)
        : [];
    const lastVisit = sanitizeDate(body.lastVisit || new Date().toISOString());

    await db.prepare(`
        INSERT INTO patients (
            id, organization_id, clinic_id, name, age, gender, contact, medical_history, last_visit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        id,
        organizationId,
        activeClinicId,
        name,
        Number.isFinite(age) ? age : null,
        body.gender ? String(body.gender) : null,
        body.contact ? String(body.contact) : null,
        JSON.stringify(medicalHistory),
        lastVisit
    ).run();

    return jsonResponse({
        patient: {
            id,
            organizationId,
            clinicId: activeClinicId,
            name,
            age: Number.isFinite(age) ? age : '',
            gender: body.gender || '',
            contact: body.contact || '',
            medicalHistory,
            lastVisit,
        },
    }, 201);
}

async function deletePatient(env, request, patientId) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);

    const patient = await db
        .prepare('SELECT id, organization_id, clinic_id FROM patients WHERE id = ? LIMIT 1')
        .bind(patientId)
        .first();
    if (!patient) throw new HttpError(404, 'Patient not found.');

    if (user.role === 'admin' && patient.organization_id !== user.organizationId) {
        throw new HttpError(403, 'Patient is outside your organization.');
    }
    if (user.role === 'staff') {
        if (patient.organization_id !== user.organizationId || !user.clinicIds.includes(patient.clinic_id)) {
            throw new HttpError(403, 'Patient is outside your scope.');
        }
    }

    await db.prepare('DELETE FROM patients WHERE id = ?').bind(patientId).run();
    return jsonResponse({ ok: true });
}

async function listServices(env, request, url) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const activeClinicId = await resolveActiveClinicId(db, request, user, false);

    let sql = `
        SELECT id, organization_id, clinic_id, name, price_cents, duration_minutes, created_at
        FROM services
        WHERE 1 = 1
    `;
    const bindings = [];

    if (user.role === 'admin' || user.role === 'staff') {
        sql += ' AND organization_id = ?';
        bindings.push(user.organizationId);
    }
    if (user.role === 'staff') {
        if (!user.clinicIds?.length) return jsonResponse({ services: [] });
        const placeholders = user.clinicIds.map(() => '?').join(',');
        sql += ` AND clinic_id IN (${placeholders})`;
        bindings.push(...user.clinicIds);
    }
    if (activeClinicId) {
        sql += ' AND clinic_id = ?';
        bindings.push(activeClinicId);
    }
    if (q) {
        sql += ' AND LOWER(name) LIKE ?';
        bindings.push(`%${q}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const result = bindings.length > 0
        ? await db.prepare(sql).bind(...bindings).all()
        : await db.prepare(sql).all();

    return jsonResponse({
        services: (result.results || []).map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            clinicId: row.clinic_id,
            name: row.name,
            price: fromCents(row.price_cents),
            duration: row.duration_minutes,
            type: 'service',
            createdAt: row.created_at,
        })),
    });
}

async function createService(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);
    const name = String(body.name || '').trim();
    if (!name) throw new HttpError(400, 'Service name is required.');

    const activeClinicId = await resolveActiveClinicId(db, request, user, user.role !== 'super_admin');
    const organizationId = user.role === 'super_admin'
        ? String(body.organizationId || '').trim()
        : user.organizationId;

    if (!organizationId || !activeClinicId) throw new HttpError(400, 'Organization and clinic are required.');

    const id = crypto.randomUUID();
    const duration = Number.parseInt(body.duration, 10) || 0;
    const priceCents = toCents(body.price);

    await db.prepare(`
        INSERT INTO services (id, organization_id, clinic_id, name, price_cents, duration_minutes)
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, organizationId, activeClinicId, name, priceCents, duration).run();

    return jsonResponse({
        service: {
            id,
            organizationId,
            clinicId: activeClinicId,
            name,
            price: fromCents(priceCents),
            duration,
            type: 'service',
        },
    }, 201);
}

async function deleteService(env, request, serviceId) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const service = await db
        .prepare('SELECT id, organization_id, clinic_id FROM services WHERE id = ? LIMIT 1')
        .bind(serviceId)
        .first();
    if (!service) throw new HttpError(404, 'Service not found.');

    if (user.role === 'admin' && service.organization_id !== user.organizationId) {
        throw new HttpError(403, 'Service is outside your organization.');
    }
    if (user.role === 'staff') {
        if (service.organization_id !== user.organizationId || !user.clinicIds.includes(service.clinic_id)) {
            throw new HttpError(403, 'Service is outside your scope.');
        }
    }

    await db.prepare('DELETE FROM services WHERE id = ?').bind(serviceId).run();
    return jsonResponse({ ok: true });
}

async function listInventory(env, request, url) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const activeClinicId = await resolveActiveClinicId(db, request, user, false);

    let sql = `
        SELECT
            id, organization_id, clinic_id, name, category, unit, stock_quantity,
            reorder_threshold, cost_price_cents, sell_price_cents, expiry_date, created_at, updated_at
        FROM inventory_items
        WHERE 1 = 1
    `;
    const bindings = [];

    if (user.role === 'admin' || user.role === 'staff') {
        sql += ' AND organization_id = ?';
        bindings.push(user.organizationId);
    }
    if (user.role === 'staff') {
        if (!user.clinicIds?.length) return jsonResponse({ items: [] });
        const placeholders = user.clinicIds.map(() => '?').join(',');
        sql += ` AND clinic_id IN (${placeholders})`;
        bindings.push(...user.clinicIds);
    }
    if (activeClinicId) {
        sql += ' AND clinic_id = ?';
        bindings.push(activeClinicId);
    }
    if (q) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ?)';
        bindings.push(`%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY created_at DESC';

    const result = bindings.length > 0
        ? await db.prepare(sql).bind(...bindings).all()
        : await db.prepare(sql).all();

    return jsonResponse({
        items: (result.results || []).map((row) => {
            const stockStatus = row.stock_quantity <= 0
                ? 'critical'
                : row.stock_quantity <= row.reorder_threshold
                    ? 'low'
                    : 'good';
            const expiryMeta = getExpiryMeta(row.expiry_date);
            const status = expiryMeta.expiryStatus === 'expired'
                ? 'expired'
                : stockStatus === 'critical'
                    ? 'critical'
                    : stockStatus === 'low'
                        ? 'low'
                        : expiryMeta.expiryStatus === 'expiring_soon'
                            ? 'expiring_soon'
                            : 'good';

            return {
                id: row.id,
                organizationId: row.organization_id,
                clinicId: row.clinic_id,
                name: row.name,
                category: row.category,
                unit: row.unit,
                stock: row.stock_quantity,
                threshold: row.reorder_threshold,
                costPrice: fromCents(row.cost_price_cents),
                sellPrice: fromCents(row.sell_price_cents),
                expiryDate: row.expiry_date || '',
                daysToExpiry: expiryMeta.daysToExpiry,
                expiryStatus: expiryMeta.expiryStatus,
                stockStatus,
                status,
                type: 'inventory',
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };
        }),
    });
}

async function createInventoryItem(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const name = String(body.name || '').trim();
    const category = String(body.category || '').trim() || 'General';
    const unit = String(body.unit || '').trim() || 'pcs';
    if (!name) throw new HttpError(400, 'Item name is required.');

    const activeClinicId = await resolveActiveClinicId(db, request, user, user.role !== 'super_admin');
    const organizationId = user.role === 'super_admin'
        ? String(body.organizationId || '').trim()
        : user.organizationId;
    if (!organizationId || !activeClinicId) throw new HttpError(400, 'Organization and clinic are required.');

    const id = crypto.randomUUID();
    const stock = Math.max(0, Number.parseInt(body.stock, 10) || 0);
    const threshold = Math.max(0, Number.parseInt(body.threshold, 10) || 0);
    const costCents = toCents(body.costPrice);
    const sellCents = toCents(body.sellPrice);
    const expiryDate = sanitizeOptionalDate(body.expiryDate);

    const statements = [
        db.prepare(`
            INSERT INTO inventory_items (
                id, organization_id, clinic_id, name, category, unit,
                stock_quantity, reorder_threshold, cost_price_cents, sell_price_cents, expiry_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, organizationId, activeClinicId, name, category, unit, stock, threshold, costCents, sellCents, expiryDate),
    ];

    if (stock > 0) {
        statements.push(
            db.prepare(`
                INSERT INTO inventory_transactions (
                    id, inventory_item_id, organization_id, clinic_id, type, quantity, unit_cost_cents, reference_type
                ) VALUES (?, ?, ?, ?, 'purchase', ?, ?, 'inventory_create')
            `).bind(crypto.randomUUID(), id, organizationId, activeClinicId, stock, costCents)
        );
    }

    await db.batch(statements);

    return jsonResponse({
        item: {
            id,
            organizationId,
            clinicId: activeClinicId,
            name,
            category,
            unit,
            stock,
            threshold,
            costPrice: fromCents(costCents),
            sellPrice: fromCents(sellCents),
            expiryDate: expiryDate || '',
            type: 'inventory',
        },
    }, 201);
}

async function restockInventoryItem(env, request, itemId) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);
    const quantity = Number.parseInt(body.quantity, 10) || 0;
    if (quantity <= 0) throw new HttpError(400, 'Quantity must be greater than zero.');
    const hasExpiryDateField = Object.prototype.hasOwnProperty.call(body, 'expiryDate');
    const expiryDateValue = hasExpiryDateField ? sanitizeOptionalDate(body.expiryDate) : null;

    const item = await db
        .prepare(`
            SELECT id, organization_id, clinic_id, stock_quantity, cost_price_cents
            FROM inventory_items
            WHERE id = ?
            LIMIT 1
        `)
        .bind(itemId)
        .first();
    if (!item) throw new HttpError(404, 'Inventory item not found.');

    if (user.role === 'admin' && item.organization_id !== user.organizationId) {
        throw new HttpError(403, 'Item is outside your organization.');
    }
    if (user.role === 'staff') {
        if (item.organization_id !== user.organizationId || !user.clinicIds.includes(item.clinic_id)) {
            throw new HttpError(403, 'Item is outside your scope.');
        }
    }

    const unitCostCents = toCents(body.costPrice ?? fromCents(item.cost_price_cents || 0));
    await db.batch([
        db.prepare(`
            UPDATE inventory_items
            SET stock_quantity = stock_quantity + ?,
                cost_price_cents = ?,
                expiry_date = CASE WHEN ? = 1 THEN ? ELSE expiry_date END,
                updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            WHERE id = ?
        `).bind(quantity, unitCostCents, hasExpiryDateField ? 1 : 0, expiryDateValue, itemId),
        db.prepare(`
            INSERT INTO inventory_transactions (
                id, inventory_item_id, organization_id, clinic_id, type, quantity, unit_cost_cents, reference_type
            ) VALUES (?, ?, ?, ?, 'purchase', ?, ?, 'manual_restock')
        `).bind(crypto.randomUUID(), itemId, item.organization_id, item.clinic_id, quantity, unitCostCents),
    ]);

    return jsonResponse({ ok: true });
}

async function listAppointments(env, request, url) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const date = sanitizeDate(url.searchParams.get('date') || new Date().toISOString());
    const activeClinicId = await resolveActiveClinicId(db, request, user, false);

    let sql = `
        SELECT
            id, organization_id, clinic_id, patient_id, patient_name, type, doctor,
            scheduled_date, scheduled_time, status, notes, created_at
        FROM appointments
        WHERE scheduled_date = ?
    `;
    const bindings = [date];

    if (user.role === 'admin' || user.role === 'staff') {
        sql += ' AND organization_id = ?';
        bindings.push(user.organizationId);
    }
    if (user.role === 'staff') {
        if (!user.clinicIds?.length) return jsonResponse({ appointments: [] });
        const placeholders = user.clinicIds.map(() => '?').join(',');
        sql += ` AND clinic_id IN (${placeholders})`;
        bindings.push(...user.clinicIds);
    }
    if (activeClinicId) {
        sql += ' AND clinic_id = ?';
        bindings.push(activeClinicId);
    }
    sql += ' ORDER BY scheduled_time ASC, created_at ASC';

    const result = await db.prepare(sql).bind(...bindings).all();
    return jsonResponse({
        appointments: (result.results || []).map((row) => ({
            id: row.id,
            organizationId: row.organization_id,
            clinicId: row.clinic_id,
            patientId: row.patient_id,
            patient: row.patient_name,
            type: row.type,
            doctor: row.doctor || '',
            time: row.scheduled_time,
            date: row.scheduled_date,
            status: row.status,
            notes: row.notes || '',
            createdAt: row.created_at,
        })),
    });
}

async function createAppointment(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const patientName = String(body.patientName || '').trim();
    const type = String(body.type || '').trim();
    const scheduledDate = sanitizeDate(body.date || new Date().toISOString());
    const scheduledTime = String(body.time || '').trim();
    if (!patientName || !type || !scheduledTime) {
        throw new HttpError(400, 'Patient, type and time are required.');
    }

    const activeClinicId = await resolveActiveClinicId(db, request, user, user.role !== 'super_admin');
    const organizationId = user.role === 'super_admin'
        ? String(body.organizationId || '').trim()
        : user.organizationId;
    if (!organizationId || !activeClinicId) throw new HttpError(400, 'Organization and clinic are required.');

    const id = crypto.randomUUID();
    const status = normalizeAppointmentStatus(body.status || 'scheduled');

    await db.prepare(`
        INSERT INTO appointments (
            id, organization_id, clinic_id, patient_id, patient_name, type, doctor,
            scheduled_date, scheduled_time, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        id,
        organizationId,
        activeClinicId,
        body.patientId ? String(body.patientId) : null,
        patientName,
        type,
        body.doctor ? String(body.doctor) : null,
        scheduledDate,
        scheduledTime,
        status,
        body.notes ? String(body.notes) : null
    ).run();

    return jsonResponse({
        appointment: {
            id,
            organizationId,
            clinicId: activeClinicId,
            patientId: body.patientId || null,
            patient: patientName,
            type,
            doctor: body.doctor || '',
            date: scheduledDate,
            time: scheduledTime,
            status,
            notes: body.notes || '',
        },
    }, 201);
}

async function updateAppointmentStatus(env, request, appointmentId) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);
    const status = normalizeAppointmentStatus(body.status);

    const appointment = await db
        .prepare('SELECT id, organization_id, clinic_id FROM appointments WHERE id = ? LIMIT 1')
        .bind(appointmentId)
        .first();
    if (!appointment) throw new HttpError(404, 'Appointment not found.');

    if (user.role === 'admin' && appointment.organization_id !== user.organizationId) {
        throw new HttpError(403, 'Appointment is outside your organization.');
    }
    if (user.role === 'staff') {
        if (appointment.organization_id !== user.organizationId || !user.clinicIds.includes(appointment.clinic_id)) {
            throw new HttpError(403, 'Appointment is outside your scope.');
        }
    }

    await db.prepare(`
        UPDATE appointments
        SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?
    `).bind(status, appointmentId).run();

    return jsonResponse({ ok: true });
}

async function getReportsOverview(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const activeClinicId = await resolveActiveClinicId(db, request, user, false);

    let scopeSql = '';
    const scopeBindings = [];
    if (user.role === 'admin' || user.role === 'staff') {
        scopeSql += ' AND organization_id = ?';
        scopeBindings.push(user.organizationId);
    }
    if (user.role === 'staff') {
        if (!user.clinicIds?.length) {
            return jsonResponse({ monthlyRevenue: [], patientCount: 0, lowStockCount: 0, appointmentCount: 0 });
        }
        const placeholders = user.clinicIds.map(() => '?').join(',');
        scopeSql += ` AND clinic_id IN (${placeholders})`;
        scopeBindings.push(...user.clinicIds);
    }
    if (activeClinicId) {
        scopeSql += ' AND clinic_id = ?';
        scopeBindings.push(activeClinicId);
    }

    const patients = await db.prepare(`SELECT COUNT(*) AS total FROM patients WHERE 1=1 ${scopeSql}`).bind(...scopeBindings).first();
    const lowStock = await db.prepare(`SELECT COUNT(*) AS total FROM inventory_items WHERE stock_quantity <= reorder_threshold ${scopeSql}`).bind(...scopeBindings).first();
    const appointments = await db.prepare(`SELECT COUNT(*) AS total FROM appointments WHERE 1=1 ${scopeSql}`).bind(...scopeBindings).first();

    const revenueRows = await db.prepare(`
        SELECT substr(invoice_date, 1, 7) AS month, COALESCE(SUM(total_cents), 0) AS total
        FROM invoices
        WHERE status != 'void' ${scopeSql}
        GROUP BY substr(invoice_date, 1, 7)
        ORDER BY month ASC
        LIMIT 12
    `).bind(...scopeBindings).all();

    return jsonResponse({
        monthlyRevenue: (revenueRows.results || []).map((row) => ({
            month: row.month,
            revenue: fromCents(row.total),
        })),
        patientCount: Number(patients?.total || 0),
        lowStockCount: Number(lowStock?.total || 0),
        appointmentCount: Number(appointments?.total || 0),
    });
}

async function getInvoiceDetails(env, request, invoiceId) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);

    const invoice = await db.prepare(`
        SELECT
            id, organization_id, clinic_id, invoice_number, patient_id, patient_name,
            patient_contact, invoice_date, status, subtotal_cents, tax_cents,
            discount_cents, total_cents, notes, created_at
            , (SELECT c.name FROM clinics c WHERE c.id = invoices.clinic_id) AS clinic_name
        FROM invoices
        WHERE id = ?
        LIMIT 1
    `).bind(invoiceId).first();

    if (!invoice) throw new HttpError(404, 'Invoice not found.');
    if (user.role === 'admin' && invoice.organization_id !== user.organizationId) {
        throw new HttpError(403, 'Invoice is outside your organization.');
    }
    if (user.role === 'staff') {
        if (invoice.organization_id !== user.organizationId || !user.clinicIds.includes(invoice.clinic_id)) {
            throw new HttpError(403, 'Invoice is outside your scope.');
        }
    }

    const itemsResult = await db.prepare(`
        SELECT id, item_name, unit_price_cents, quantity, line_total_cents, item_type, inventory_item_id
        FROM invoice_items
        WHERE invoice_id = ?
        ORDER BY created_at ASC
    `).bind(invoiceId).all();

    return jsonResponse({
        invoice: {
            id: invoice.id,
            organizationId: invoice.organization_id,
            clinicId: invoice.clinic_id,
            clinicName: invoice.clinic_name || '',
            invoiceNumber: invoice.invoice_number,
            patientId: invoice.patient_id,
            patientName: invoice.patient_name,
            patientContact: invoice.patient_contact || '',
            date: invoice.invoice_date,
            status: invoice.status,
            subtotal: fromCents(invoice.subtotal_cents),
            tax: fromCents(invoice.tax_cents),
            discount: fromCents(invoice.discount_cents),
            total: fromCents(invoice.total_cents),
            notes: invoice.notes || '',
            createdAt: invoice.created_at,
            items: (itemsResult.results || []).map((item) => ({
                id: item.id,
                name: item.item_name,
                price: fromCents(item.unit_price_cents),
                quantity: item.quantity,
                total: fromCents(item.line_total_cents),
                itemType: item.item_type || 'service',
                inventoryItemId: item.inventory_item_id || null,
            })),
        },
    });
}

async function listInvoices(env, request, url) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const status = (url.searchParams.get('status') || '').trim().toLowerCase();
    const activeClinicId = await resolveActiveClinicId(db, request, user, false);

    let sql = `
        SELECT
            i.id,
            i.organization_id,
            i.clinic_id,
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

    if (user.role === 'admin' || user.role === 'staff') {
        sql += ' AND i.organization_id = ?';
        bindings.push(user.organizationId);
    }

    if (user.role === 'staff') {
        if (!user.clinicIds || user.clinicIds.length === 0) {
            return jsonResponse({ invoices: [] });
        }
        const clinicPlaceholders = user.clinicIds.map(() => '?').join(',');
        sql += ` AND i.clinic_id IN (${clinicPlaceholders})`;
        bindings.push(...user.clinicIds);
    }

    if (activeClinicId) {
        sql += ' AND i.clinic_id = ?';
        bindings.push(activeClinicId);
    }

    if (status && status !== 'all') {
        if (!INVOICE_STATUSES.has(status)) throw new HttpError(400, 'Invalid status filter.');
        sql += ' AND i.status = ?';
        bindings.push(status);
    }

    if (q) {
        sql += ' AND (LOWER(i.invoice_number) LIKE ? OR LOWER(i.patient_name) LIKE ?)';
        bindings.push(`%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY i.invoice_date DESC, i.created_at DESC';

    const statement = db.prepare(sql);
    const result = bindings.length > 0
        ? await statement.bind(...bindings).all()
        : await statement.all();

    return jsonResponse({
        invoices: (result.results || []).map(mapInvoiceRow),
    });
}
async function createInvoice(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) throw new HttpError(400, 'Invoice must contain at least one item.');

    const normalizedItems = items.map((item) => {
        const name = String(item.name || '').trim();
        const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
        const unitPriceCents = toCents(item.price);
        const itemType = String(item.itemType || 'service').toLowerCase() === 'inventory' ? 'inventory' : 'service';
        const inventoryItemId = itemType === 'inventory' && item.inventoryItemId
            ? String(item.inventoryItemId).trim()
            : null;
        if (!name) throw new HttpError(400, 'Each invoice item must include a name.');
        return {
            id: crypto.randomUUID(),
            name,
            quantity,
            unitPriceCents,
            lineTotalCents: quantity * unitPriceCents,
            itemType,
            inventoryItemId,
        };
    });

    const patientName = String(body.patientName || '').trim();
    if (!patientName) throw new HttpError(400, 'Patient name is required.');

    const status = normalizeInvoiceStatus(body.status || 'pending');
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = await resolveUniqueInvoiceNumber(db, body.invoiceNumber);
    const invoiceDate = sanitizeDate(body.date);
    const subtotalCents = normalizedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const taxCents = toCents(body.tax);
    const discountCents = toCents(body.discount);
    const totalCents = Math.max(0, subtotalCents + taxCents - discountCents);

    const activeClinicId = await resolveActiveClinicId(db, request, user, user.role !== 'super_admin');
    const organizationId = user.role === 'super_admin'
        ? (body.organizationId ? String(body.organizationId) : null)
        : user.organizationId;

    const statements = [
        db
            .prepare(`
                INSERT INTO invoices (
                    id,
                    organization_id,
                    clinic_id,
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                invoiceId,
                organizationId,
                activeClinicId,
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
            db
                .prepare(`
                    INSERT INTO invoice_items (
                        id,
                        invoice_id,
                        item_name,
                        unit_price_cents,
                        quantity,
                        line_total_cents,
                        item_type,
                        inventory_item_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    item.id,
                    invoiceId,
                    item.name,
                    item.unitPriceCents,
                    item.quantity,
                    item.lineTotalCents,
                    item.itemType,
                    item.inventoryItemId
                )
        );
    });

    const inventoryItems = normalizedItems.filter((item) => item.itemType === 'inventory');
    for (const item of inventoryItems) {
        if (!item.inventoryItemId) {
            throw new HttpError(400, 'Inventory item is missing inventoryItemId.');
        }

        const inventoryRow = await db.prepare(`
            SELECT id, organization_id, clinic_id, stock_quantity, cost_price_cents
            FROM inventory_items
            WHERE id = ?
            LIMIT 1
        `).bind(item.inventoryItemId).first();

        if (!inventoryRow) {
            throw new HttpError(400, `Inventory item not found: ${item.name}`);
        }
        if (inventoryRow.organization_id !== organizationId || inventoryRow.clinic_id !== activeClinicId) {
            throw new HttpError(400, `Inventory item is outside selected clinic: ${item.name}`);
        }
        if (Number(inventoryRow.stock_quantity || 0) < item.quantity) {
            throw new HttpError(400, `Insufficient stock for ${item.name}.`);
        }

        statements.push(
            db.prepare(`
                UPDATE inventory_items
                SET stock_quantity = stock_quantity - ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
            `).bind(item.quantity, item.inventoryItemId)
        );

        statements.push(
            db.prepare(`
                INSERT INTO inventory_transactions (
                    id, inventory_item_id, organization_id, clinic_id, type, quantity, unit_cost_cents, reference_type, reference_id
                ) VALUES (?, ?, ?, ?, 'sale', ?, ?, 'invoice', ?)
            `).bind(
                crypto.randomUUID(),
                item.inventoryItemId,
                organizationId,
                activeClinicId,
                item.quantity,
                Number(inventoryRow.cost_price_cents || 0),
                invoiceId
            )
        );
    }

    if (status === 'paid' && totalCents > 0) {
        statements.push(
            db
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
        await db.batch(statements);
    } catch (error) {
        const message = extractErrorMessage(error);
        if (message.includes('UNIQUE constraint failed') && message.includes('invoices.invoice_number')) {
            throw new HttpError(409, 'Invoice number already exists.');
        }
        throw new HttpError(500, message || 'Failed to create invoice.');
    }

    return jsonResponse({
        invoice: {
            id: invoiceId,
            organizationId,
            clinicId: activeClinicId,
            invoiceNumber,
            date: invoiceDate,
            patient: patientName,
            amount: fromCents(totalCents),
            status,
        },
    }, 201);
}

async function updateInvoiceStatus(env, request, invoiceId) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const body = await parseJsonRequest(request);
    const status = normalizeInvoiceStatus(body.status);

    const invoice = await db
        .prepare(`
            SELECT
                id,
                organization_id,
                clinic_id,
                invoice_date,
                total_cents,
                status
            FROM invoices
            WHERE id = ?
        `)
        .bind(invoiceId)
        .first();
    if (!invoice) throw new HttpError(404, 'Invoice not found.');

    if (user.role === 'admin' && invoice.organization_id !== user.organizationId) {
        throw new HttpError(403, 'Invoice is outside your organization.');
    }
    if (user.role === 'staff') {
        if (invoice.organization_id !== user.organizationId || !user.clinicIds.includes(invoice.clinic_id)) {
            throw new HttpError(403, 'Invoice is outside your access scope.');
        }
    }

    const statements = [
        db
            .prepare(`
                UPDATE invoices
                SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
            `)
            .bind(status, invoiceId),
    ];

    if (status === 'paid') {
        const paid = await db
            .prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total FROM payments WHERE invoice_id = ?')
            .bind(invoiceId)
            .first();
        const outstanding = Math.max(0, Number(invoice.total_cents || 0) - Number(paid.total || 0));

        if (outstanding > 0) {
            statements.push(
                db
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

    await db.batch(statements);
    return jsonResponse({ ok: true });
}

async function getAccountingSummary(env, request) {
    const { user } = await requireAuth(request, env);
    const db = requireDb(env);
    const activeClinicId = await resolveActiveClinicId(db, request, user, false);

    let sql = `
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
    `;
    const bindings = [];

    if (user.role === 'admin' || user.role === 'staff') {
        sql += ' AND i.organization_id = ?';
        bindings.push(user.organizationId);
    }

    if (user.role === 'staff') {
        if (!user.clinicIds || user.clinicIds.length === 0) {
            return jsonResponse({
                cashReceived: 0,
                pendingAmount: 0,
                overdueAmount: 0,
                receivables: 0,
                invoiceCount: 0,
            });
        }
        const clinicPlaceholders = user.clinicIds.map(() => '?').join(',');
        sql += ` AND i.clinic_id IN (${clinicPlaceholders})`;
        bindings.push(...user.clinicIds);
    }

    if (activeClinicId) {
        sql += ' AND i.clinic_id = ?';
        bindings.push(activeClinicId);
    }

    const invoicesResult = bindings.length > 0
        ? await db.prepare(sql).bind(...bindings).all()
        : await db.prepare(sql).all();

    let paymentSql = `
        SELECT COALESCE(SUM(p.amount_cents), 0) AS total
        FROM payments p
        JOIN invoices i ON i.id = p.invoice_id
        WHERE 1 = 1
    `;
    const paymentBindings = [];

    if (user.role === 'admin' || user.role === 'staff') {
        paymentSql += ' AND i.organization_id = ?';
        paymentBindings.push(user.organizationId);
    }

    if (user.role === 'staff') {
        const clinicPlaceholders = user.clinicIds.map(() => '?').join(',');
        paymentSql += ` AND i.clinic_id IN (${clinicPlaceholders})`;
        paymentBindings.push(...user.clinicIds);
    }

    if (activeClinicId) {
        paymentSql += ' AND i.clinic_id = ?';
        paymentBindings.push(activeClinicId);
    }

    const payments = paymentBindings.length > 0
        ? await db.prepare(paymentSql).bind(...paymentBindings).first()
        : await db.prepare(paymentSql).first();

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
        cashReceived: fromCents(payments?.total || 0),
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

            // Runtime schema bootstrap can fail unpredictably on remote isolates.
            // Use explicit migrations for schema changes.

            if (pathname === '/api/auth/login' && request.method === 'POST') return await login(env, request);
            if (pathname === '/api/auth/session' && request.method === 'GET') return await getSession(env, request);
            if (pathname === '/api/auth/logout' && request.method === 'POST') return await logout(env, request);

            if (pathname === '/api/tenant/bootstrap' && request.method === 'GET') return await getTenantBootstrap(env, request);

            if (pathname === '/api/super-admin/overview' && request.method === 'GET') return await getSuperAdminOverview(env, request);
            if (pathname === '/api/super-admin/organizations' && request.method === 'POST') return await createOrganizationWithAdmin(env, request);
            if (pathname === '/api/super-admin/admins' && request.method === 'POST') return await createAdminForOrganization(env, request);

            if (pathname === '/api/admin/supervision' && request.method === 'GET') return await getAdminSupervision(env, request);
            if (pathname === '/api/admin/clinics' && request.method === 'POST') return await createClinic(env, request);
            if (pathname === '/api/admin/staff' && request.method === 'POST') return await createStaff(env, request);

            const resetPasswordMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/password$/);
            if (resetPasswordMatch && request.method === 'PATCH') {
                return await resetUserPassword(env, request, decodeURIComponent(resetPasswordMatch[1]));
            }

            if (pathname === '/api/invoices' && request.method === 'GET') return await listInvoices(env, request, url);
            if (pathname === '/api/invoices' && request.method === 'POST') return await createInvoice(env, request);

            if (pathname === '/api/patients' && request.method === 'GET') return await listPatients(env, request, url);
            if (pathname === '/api/patients' && request.method === 'POST') return await createPatient(env, request);
            const patientMatch = pathname.match(/^\/api\/patients\/([^/]+)$/);
            if (patientMatch && request.method === 'DELETE') {
                return await deletePatient(env, request, decodeURIComponent(patientMatch[1]));
            }

            if (pathname === '/api/services' && request.method === 'GET') return await listServices(env, request, url);
            if (pathname === '/api/services' && request.method === 'POST') return await createService(env, request);
            const serviceMatch = pathname.match(/^\/api\/services\/([^/]+)$/);
            if (serviceMatch && request.method === 'DELETE') {
                return await deleteService(env, request, decodeURIComponent(serviceMatch[1]));
            }

            if (pathname === '/api/inventory' && request.method === 'GET') return await listInventory(env, request, url);
            if (pathname === '/api/inventory' && request.method === 'POST') return await createInventoryItem(env, request);
            const restockMatch = pathname.match(/^\/api\/inventory\/([^/]+)\/restock$/);
            if (restockMatch && request.method === 'PATCH') {
                return await restockInventoryItem(env, request, decodeURIComponent(restockMatch[1]));
            }

            if (pathname === '/api/appointments' && request.method === 'GET') return await listAppointments(env, request, url);
            if (pathname === '/api/appointments' && request.method === 'POST') return await createAppointment(env, request);
            const appointmentStatusMatch = pathname.match(/^\/api\/appointments\/([^/]+)\/status$/);
            if (appointmentStatusMatch && request.method === 'PATCH') {
                return await updateAppointmentStatus(env, request, decodeURIComponent(appointmentStatusMatch[1]));
            }

            const statusMatch = pathname.match(/^\/api\/invoices\/([^/]+)\/status$/);
            if (statusMatch && request.method === 'PATCH') {
                return await updateInvoiceStatus(env, request, decodeURIComponent(statusMatch[1]));
            }

            const invoiceMatch = pathname.match(/^\/api\/invoices\/([^/]+)$/);
            if (invoiceMatch && request.method === 'GET') {
                return await getInvoiceDetails(env, request, decodeURIComponent(invoiceMatch[1]));
            }

            if (pathname === '/api/accounting/summary' && request.method === 'GET') return await getAccountingSummary(env, request);
            if (pathname === '/api/reports/overview' && request.method === 'GET') return await getReportsOverview(env, request);

            return jsonResponse({ error: 'Not found.' }, 404);
        } catch (error) {
            if (error instanceof HttpError) {
                return jsonResponse({ error: error.message }, error.status);
            }

            const detail = extractErrorMessage(error) || 'Unknown error.';
            return jsonResponse({
                error: 'Internal server error.',
                detail,
            }, 500);
        }
    },
};
