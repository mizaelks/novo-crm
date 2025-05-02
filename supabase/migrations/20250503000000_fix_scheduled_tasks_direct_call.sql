
-- Create cron job directly in pg_cron without the extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing job if it exists
SELECT cron.unschedule('check-scheduled-actions');
SELECT cron.unschedule('invoke-scheduled-tasks');

-- Re-create the cron job to run every minute with direct edge function URL
SELECT cron.schedule(
  'invoke-scheduled-tasks',
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
      url := 'https://ffykgxnmijoonyutchzx.supabase.co/functions/v1/scheduled-tasks',
      headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmeWtneG5taWpvb255dXRjaHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDYxODcsImV4cCI6MjA2MDM4MjE4N30.tO2-3eJN1DlM_WubpMaIEpounF-9qzqOunRshUuMo8w'
      ),
      body := jsonb_build_object('timestamp', now()::text, 'timezone', 'America/Sao_Paulo')
  ) AS request_id;
  $$
);
