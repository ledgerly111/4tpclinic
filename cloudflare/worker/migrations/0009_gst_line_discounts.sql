PRAGMA foreign_keys = ON;

ALTER TABLE organizations ADD COLUMN gst_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN gst_number TEXT;

ALTER TABLE inventory_items ADD COLUMN gst_percent REAL NOT NULL DEFAULT 0;

ALTER TABLE invoice_items ADD COLUMN discount_percent REAL NOT NULL DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN discount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN gst_percent REAL NOT NULL DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN gst_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN taxable_cents INTEGER NOT NULL DEFAULT 0;

UPDATE invoice_items
SET taxable_cents = CASE
    WHEN taxable_cents IS NULL OR taxable_cents = 0 THEN MAX(0, line_total_cents - COALESCE(discount_cents, 0))
    ELSE taxable_cents
END;
