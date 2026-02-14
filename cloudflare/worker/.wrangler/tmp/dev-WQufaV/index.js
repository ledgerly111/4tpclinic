var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};
var INVOICE_STATUSES = /* @__PURE__ */ new Set(["pending", "paid", "overdue", "void"]);
var ACCOUNTING_SCHEMA_STATEMENTS = [
  "PRAGMA foreign_keys = ON",
  `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
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
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
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
  "CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)",
  "CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date)",
  "CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)",
  "CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id)"
];
var schemaReady = false;
var HttpError = class extends Error {
  static {
    __name(this, "HttpError");
  }
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
};
function toCents(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed * 100));
}
__name(toCents, "toCents");
function fromCents(value) {
  return Number(((Number(value) || 0) / 100).toFixed(2));
}
__name(fromCents, "fromCents");
function sanitizeDate(value) {
  if (!value) return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return String(value).split("T")[0];
}
__name(sanitizeDate, "sanitizeDate");
function normalizeInvoiceStatus(status) {
  const normalized = String(status || "pending").toLowerCase();
  if (!INVOICE_STATUSES.has(normalized)) {
    throw new HttpError(400, "Invalid invoice status.");
  }
  return normalized;
}
__name(normalizeInvoiceStatus, "normalizeInvoiceStatus");
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}
__name(jsonResponse, "jsonResponse");
function requireDb(env) {
  if (!env.DB) {
    throw new HttpError(500, 'D1 binding "DB" is missing. Check wrangler.toml.');
  }
  return env.DB;
}
__name(requireDb, "requireDb");
async function ensureSchema(env) {
  if (schemaReady) return;
  const db = requireDb(env);
  await db.batch(
    ACCOUNTING_SCHEMA_STATEMENTS.map((statement) => db.prepare(statement))
  );
  schemaReady = true;
}
__name(ensureSchema, "ensureSchema");
function emptyResponse(status = 204) {
  return new Response(null, {
    status,
    headers: JSON_HEADERS
  });
}
__name(emptyResponse, "emptyResponse");
function generateInvoiceNumber() {
  const suffix = Math.floor(Math.random() * 9e4) + 1e4;
  return `INV-${Date.now()}-${suffix}`;
}
__name(generateInvoiceNumber, "generateInvoiceNumber");
function mapInvoiceRow(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    patient: row.patient_name,
    patientContact: row.patient_contact || "",
    date: row.invoice_date,
    amount: fromCents(row.total_cents),
    status: row.status,
    service: row.service_names || "",
    paidAmount: fromCents(row.paid_cents),
    outstandingAmount: fromCents(row.outstanding_cents)
  };
}
__name(mapInvoiceRow, "mapInvoiceRow");
async function parseJsonRequest(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}
__name(parseJsonRequest, "parseJsonRequest");
async function listInvoices(env, url) {
  const db = requireDb(env);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = (url.searchParams.get("status") || "").trim().toLowerCase();
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
  if (status && status !== "all") {
    if (!INVOICE_STATUSES.has(status)) {
      throw new HttpError(400, "Invalid status filter.");
    }
    sql += " AND i.status = ?";
    bindings.push(status);
  }
  if (q) {
    sql += " AND (LOWER(i.invoice_number) LIKE ? OR LOWER(i.patient_name) LIKE ?)";
    bindings.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY i.invoice_date DESC, i.created_at DESC";
  const statement = db.prepare(sql);
  const result = bindings.length > 0 ? await statement.bind(...bindings).all() : await statement.all();
  return jsonResponse({
    invoices: (result.results || []).map(mapInvoiceRow)
  });
}
__name(listInvoices, "listInvoices");
async function createInvoice(env, request) {
  const db = requireDb(env);
  const body = await parseJsonRequest(request);
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    throw new HttpError(400, "Invoice must contain at least one item.");
  }
  const normalizedItems = items.map((item) => {
    const name = String(item.name || "").trim();
    const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
    const unitPriceCents = toCents(item.price);
    if (!name) {
      throw new HttpError(400, "Each invoice item must include a name.");
    }
    return {
      id: crypto.randomUUID(),
      name,
      quantity,
      unitPriceCents,
      lineTotalCents: quantity * unitPriceCents
    };
  });
  const patientName = String(body.patientName || "").trim();
  if (!patientName) {
    throw new HttpError(400, "Patient name is required.");
  }
  const status = normalizeInvoiceStatus(body.status || "pending");
  const invoiceId = crypto.randomUUID();
  const invoiceNumber = String(body.invoiceNumber || generateInvoiceNumber()).trim();
  const invoiceDate = sanitizeDate(body.date);
  const subtotalCents = normalizedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const taxCents = toCents(body.tax);
  const discountCents = toCents(body.discount);
  const totalCents = Math.max(0, subtotalCents + taxCents - discountCents);
  const statements = [
    db.prepare(`
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
            `).bind(
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
      "USD",
      body.notes ? String(body.notes) : null
    )
  ];
  normalizedItems.forEach((item) => {
    statements.push(
      db.prepare(`
                    INSERT INTO invoice_items (
                        id,
                        invoice_id,
                        item_name,
                        unit_price_cents,
                        quantity,
                        line_total_cents
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
        item.id,
        invoiceId,
        item.name,
        item.unitPriceCents,
        item.quantity,
        item.lineTotalCents
      )
    );
  });
  if (status === "paid" && totalCents > 0) {
    statements.push(
      db.prepare(`
                    INSERT INTO payments (
                        id,
                        invoice_id,
                        amount_cents,
                        payment_date,
                        method,
                        notes
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
        crypto.randomUUID(),
        invoiceId,
        totalCents,
        invoiceDate,
        "manual",
        "Auto-created from paid invoice status."
      )
    );
  }
  try {
    await db.batch(statements);
  } catch (error) {
    const message = String(error.message || "");
    if (message.includes("UNIQUE constraint failed: invoices.invoice_number")) {
      throw new HttpError(409, "Invoice number already exists.");
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
      status
    }
  }, 201);
}
__name(createInvoice, "createInvoice");
async function updateInvoiceStatus(env, request, invoiceId) {
  const db = requireDb(env);
  const body = await parseJsonRequest(request);
  const status = normalizeInvoiceStatus(body.status);
  const invoice = await db.prepare(`
            SELECT
                id,
                invoice_date,
                total_cents,
                status
            FROM invoices
            WHERE id = ?
        `).bind(invoiceId).first();
  if (!invoice) {
    throw new HttpError(404, "Invoice not found.");
  }
  const statements = [
    db.prepare(`
                UPDATE invoices
                SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
            `).bind(status, invoiceId)
  ];
  if (status === "paid") {
    const paid = await db.prepare("SELECT COALESCE(SUM(amount_cents), 0) AS total FROM payments WHERE invoice_id = ?").bind(invoiceId).first();
    const outstanding = Math.max(0, Number(invoice.total_cents || 0) - Number(paid.total || 0));
    if (outstanding > 0) {
      statements.push(
        db.prepare(`
                        INSERT INTO payments (
                            id,
                            invoice_id,
                            amount_cents,
                            payment_date,
                            method,
                            notes
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `).bind(
          crypto.randomUUID(),
          invoiceId,
          outstanding,
          sanitizeDate(body.paymentDate || invoice.invoice_date),
          body.method ? String(body.method) : "manual",
          body.notes ? String(body.notes) : "Recorded from invoice status change."
        )
      );
    }
  }
  await db.batch(statements);
  return jsonResponse({ ok: true });
}
__name(updateInvoiceStatus, "updateInvoiceStatus");
async function getAccountingSummary(env) {
  const db = requireDb(env);
  const invoicesResult = await db.prepare(`
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
        `).all();
  const payments = await db.prepare("SELECT COALESCE(SUM(amount_cents), 0) AS total FROM payments").first();
  let pendingAmountCents = 0;
  let overdueAmountCents = 0;
  let receivableAmountCents = 0;
  (invoicesResult.results || []).forEach((invoice) => {
    const outstanding = Math.max(0, Number(invoice.total_cents || 0) - Number(invoice.paid_cents || 0));
    receivableAmountCents += outstanding;
    if (invoice.status === "pending") pendingAmountCents += outstanding;
    if (invoice.status === "overdue") overdueAmountCents += outstanding;
  });
  return jsonResponse({
    cashReceived: fromCents(payments.total),
    pendingAmount: fromCents(pendingAmountCents),
    overdueAmount: fromCents(overdueAmountCents),
    receivables: fromCents(receivableAmountCents),
    invoiceCount: (invoicesResult.results || []).length
  });
}
__name(getAccountingSummary, "getAccountingSummary");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return emptyResponse();
    }
    try {
      const url = new URL(request.url);
      const { pathname } = url;
      if (pathname === "/health" && request.method === "GET") {
        return jsonResponse({
          ok: true,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      if (pathname.startsWith("/api/")) {
        await ensureSchema(env);
      }
      if (pathname === "/api/invoices" && request.method === "GET") {
        return listInvoices(env, url);
      }
      if (pathname === "/api/invoices" && request.method === "POST") {
        return createInvoice(env, request);
      }
      const statusMatch = pathname.match(/^\/api\/invoices\/([^/]+)\/status$/);
      if (statusMatch && request.method === "PATCH") {
        return updateInvoiceStatus(env, request, decodeURIComponent(statusMatch[1]));
      }
      if (pathname === "/api/accounting/summary" && request.method === "GET") {
        return getAccountingSummary(env);
      }
      return jsonResponse({ error: "Not found." }, 404);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonResponse({ error: error.message }, error.status);
      }
      return jsonResponse({
        error: "Internal server error.",
        detail: String(error.message || error)
      }, 500);
    }
  }
};

// C:/Users/user/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/user/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-0ovSwh/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// C:/Users/user/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-0ovSwh/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
