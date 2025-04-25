
-- Atualiza a função para incluir o ajuste de fuso horário (GMT -3 para Brasil)
CREATE OR REPLACE FUNCTION check_scheduled_actions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Usando timezone da América/Sao_Paulo (GMT -3)
    PERFORM net.http_post(
        url := current_setting('supabase.functions_url') || '/scheduled-tasks',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('supabase.service_role_key')
        ),
        body := jsonb_build_object(
            'timestamp', now(), 
            'timezone', 'America/Sao_Paulo'
        )
    );
END;
$$;

-- Recria o agendamento para executar a cada minuto
SELECT cron.unschedule('check-scheduled-actions');
SELECT cron.schedule(
    'check-scheduled-actions',
    '* * * * *', -- every minute
    'SELECT check_scheduled_actions()'
);

-- Adiciona coluna template_id na tabela scheduled_actions se ainda não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'scheduled_actions' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE scheduled_actions ADD COLUMN template_id UUID REFERENCES webhook_templates(id);
  END IF;
END $$;
