-- Batch pricing columns are now created through guarded schema checks in
-- cloudflare/worker/src/index.js so this migration remains safe on databases
-- where the Worker already added the columns during startup.
SELECT 1;
