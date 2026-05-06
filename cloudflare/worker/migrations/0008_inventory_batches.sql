PRAGMA foreign_keys = ON;

ALTER TABLE inventory_items ADD COLUMN package_type TEXT NOT NULL DEFAULT 'box';

CREATE TABLE IF NOT EXISTS inventory_batches (
    id TEXT PRIMARY KEY,
    inventory_item_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    strip_stock_quantity INTEGER NOT NULL DEFAULT 0,
    cost_price_cents INTEGER NOT NULL DEFAULT 0,
    expiry_date TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_batches_item_id ON inventory_batches(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expiry ON inventory_batches(expiry_date);

INSERT INTO inventory_batches (
    id,
    inventory_item_id,
    organization_id,
    clinic_id,
    batch_number,
    strip_stock_quantity,
    cost_price_cents,
    expiry_date
)
SELECT
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
    id,
    organization_id,
    clinic_id,
    'OPENING',
    strip_stock_quantity,
    cost_price_cents,
    expiry_date
FROM inventory_items
WHERE strip_stock_quantity > 0
  AND NOT EXISTS (
      SELECT 1
      FROM inventory_batches
      WHERE inventory_batches.inventory_item_id = inventory_items.id
  );
