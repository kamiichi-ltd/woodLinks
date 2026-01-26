-- Add material_type column to cards table
-- Default is 'sugi' (Cedar)
-- Allowed values: 'sugi', 'hinoki', 'walnut'

ALTER TABLE cards 
ADD COLUMN material_type text NOT NULL DEFAULT 'sugi';

-- Optional: Check constraint to enforce allowed values
ALTER TABLE cards
ADD CONSTRAINT check_material_type 
CHECK (material_type IN ('sugi', 'hinoki', 'walnut'));
