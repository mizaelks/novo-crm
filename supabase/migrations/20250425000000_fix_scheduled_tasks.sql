
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

-- Garantir que a tabela scheduled_actions tenha todas as colunas necessárias
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'scheduled_actions' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.scheduled_actions ADD COLUMN template_id UUID REFERENCES webhook_templates(id);
  END IF;
END $$;

-- Atualiza o tipo da coluna action_config para incluir o campo method
DO $$
BEGIN
  -- Verificar se todas as linhas já têm o campo method no action_config
  IF EXISTS (
    SELECT 1 FROM scheduled_actions 
    WHERE action_type = 'webhook' 
    AND NOT (action_config ? 'method')
    LIMIT 1
  ) THEN
    -- Adicionar o campo method='POST' para todas as linhas de webhook que não têm
    UPDATE scheduled_actions
    SET action_config = action_config || '{"method": "POST"}'::jsonb
    WHERE action_type = 'webhook'
    AND NOT (action_config ? 'method');
  END IF;
END $$;
