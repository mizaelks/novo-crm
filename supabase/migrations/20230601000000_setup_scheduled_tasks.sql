
-- Enable the pg_cron and pg_net extensions if they're not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to check and process scheduled actions
CREATE OR REPLACE FUNCTION check_scheduled_actions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM net.http_post(
        url := current_setting('supabase.functions_url') || '/scheduled-tasks',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('supabase.service_role_key')
        ),
        body := jsonb_build_object('timestamp', now())
    );
END;
$$;

-- Schedule the function to run every minute
SELECT cron.schedule(
    'check-scheduled-actions',
    '* * * * *', -- every minute
    'SELECT check_scheduled_actions()'
);
