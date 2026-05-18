PRAGMA foreign_keys = ON;

ALTER TABLE inventory_batches ADD COLUMN sell_price_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inventory_batches ADD COLUMN strip_sell_price_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inventory_batches ADD COLUMN individual_sell_price_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inventory_batches ADD COLUMN gst_percent REAL NOT NULL DEFAULT 0;

UPDATE inventory_batches
SET sell_price_cents = (
        SELECT inventory_items.sell_price_cents
        FROM inventory_items
        WHERE inventory_items.id = inventory_batches.inventory_item_id
    )
WHERE sell_price_cents IS NULL OR sell_price_cents <= 0;

UPDATE inventory_batches
SET strip_sell_price_cents = (
        SELECT inventory_items.strip_sell_price_cents
        FROM inventory_items
        WHERE inventory_items.id = inventory_batches.inventory_item_id
    )
WHERE strip_sell_price_cents IS NULL OR strip_sell_price_cents <= 0;

UPDATE inventory_batches
SET individual_sell_price_cents = (
        SELECT inventory_items.individual_sell_price_cents
        FROM inventory_items
        WHERE inventory_items.id = inventory_batches.inventory_item_id
    )
WHERE individual_sell_price_cents IS NULL OR individual_sell_price_cents <= 0;

UPDATE inventory_batches
SET gst_percent = (
        SELECT inventory_items.gst_percent
        FROM inventory_items
        WHERE inventory_items.id = inventory_batches.inventory_item_id
    )
WHERE gst_percent IS NULL OR gst_percent <= 0;

ALTER TABLE invoice_items ADD COLUMN batch_id TEXT;
ALTER TABLE invoice_items ADD COLUMN batch_number TEXT;
