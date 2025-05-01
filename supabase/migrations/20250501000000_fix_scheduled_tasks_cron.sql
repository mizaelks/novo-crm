
-- Fix the cron job for scheduled tasks

-- Drop existing job if it exists
SELECT cron.unschedule('check-scheduled-actions');

-- Re-create the cron job to run every minute
SELECT cron.schedule(
  'check-scheduled-actions',
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
      url := current_setting('supabase.functions_url') || '/scheduled-tasks',
      headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('supabase.service_role_key')
      ),
      body := jsonb_build_object('timestamp', now(), 'timezone', 'America/Sao_Paulo')
  ) AS request_id;
  $$
);

-- Ensure that all webhook actions have a method specified
UPDATE scheduled_actions
SET action_config = action_config || '{"method": "POST"}'::jsonb
WHERE action_type = 'webhook' 
AND NOT (action_config ? 'method');

-- Reset pending status for any failed actions that should be retried
UPDATE scheduled_actions
SET status = 'pending'
WHERE status = 'failed'
AND scheduled_datetime > now() - interval '1 day';
