ALTER TABLE inventory_items ADD COLUMN strips_per_unit INTEGER NOT NULL DEFAULT 1;
ALTER TABLE inventory_items ADD COLUMN strip_stock_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN strip_sell_price_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN sale_unit TEXT NOT NULL DEFAULT 'unit';

UPDATE inventory_items
SET strip_stock_quantity = stock_quantity * CASE WHEN strips_per_unit > 0 THEN strips_per_unit ELSE 1 END
WHERE strip_stock_quantity IS NULL OR strip_stock_quantity <= 0;

UPDATE inventory_items
SET strip_sell_price_cents = sell_price_cents
WHERE strip_sell_price_cents IS NULL OR strip_sell_price_cents <= 0;
