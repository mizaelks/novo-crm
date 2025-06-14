
-- Add alert_config column to stages table
ALTER TABLE stages ADD COLUMN IF NOT EXISTS alert_config JSONB;

-- Add comment to the column
COMMENT ON COLUMN stages.alert_config IS 'Configuration for stage alerts including enabled flag and max days';
