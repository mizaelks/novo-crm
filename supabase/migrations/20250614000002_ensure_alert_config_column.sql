
-- Ensure alert_config column exists in stages table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'stages' 
        AND column_name = 'alert_config'
    ) THEN
        ALTER TABLE stages ADD COLUMN alert_config JSONB;
        COMMENT ON COLUMN stages.alert_config IS 'Configuration for stage alerts including enabled flag and max days';
    END IF;
END $$;

-- Ensure last_stage_change_at column exists in opportunities table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'opportunities' 
        AND column_name = 'last_stage_change_at'
    ) THEN
        ALTER TABLE opportunities ADD COLUMN last_stage_change_at TIMESTAMPTZ;
        COMMENT ON COLUMN opportunities.last_stage_change_at IS 'Timestamp when the opportunity was last moved to the current stage';
        
        -- Set initial values for existing opportunities (use created_at as fallback)
        UPDATE opportunities 
        SET last_stage_change_at = created_at 
        WHERE last_stage_change_at IS NULL;
    END IF;
END $$;
