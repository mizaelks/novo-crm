
-- Add last_stage_change_at column to opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS last_stage_change_at TIMESTAMPTZ;

-- Add comment to the column
COMMENT ON COLUMN opportunities.last_stage_change_at IS 'Timestamp when the opportunity was last moved to the current stage';

-- Set initial values for existing opportunities (use created_at as fallback)
UPDATE opportunities 
SET last_stage_change_at = created_at 
WHERE last_stage_change_at IS NULL;
