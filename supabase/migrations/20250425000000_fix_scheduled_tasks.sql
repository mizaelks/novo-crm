
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

-- Atualiza a função de processamento para usar o horário correto
CREATE OR REPLACE FUNCTION process_scheduled_actions()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  scheduled_action RECORD;
  payload JSONB;
  response JSONB;
BEGIN
  -- Encontrar ações programadas que já passaram do horário agendado (usando timezone do Brasil)
  FOR scheduled_action IN 
    SELECT *
    FROM scheduled_actions
    WHERE status = 'pending'
    AND scheduled_date_time <= (now() AT TIME ZONE 'America/Sao_Paulo')
  LOOP
    -- Marcar como em processamento
    UPDATE scheduled_actions
    SET status = 'processing'
    WHERE id = scheduled_action.id;

    BEGIN
      -- Processar com base no tipo de ação
      CASE 
        WHEN scheduled_action.action_type = 'webhook' THEN
          -- Construir payload para webhook
          IF scheduled_action.template_id IS NOT NULL THEN
            -- Usar template se fornecido
            SELECT payload INTO payload
            FROM webhook_templates
            WHERE id = scheduled_action.template_id;
          ELSE
            -- Criar payload padrão
            payload = jsonb_build_object(
              'opportunity_id', scheduled_action.opportunity_id,
              'scheduled_time', scheduled_action.scheduled_date_time,
              'action_type', scheduled_action.action_type,
              'custom_data', scheduled_action.action_config
            );
          END IF;
          
          -- Enviar webhook
          PERFORM net.http_post(
            url := scheduled_action.action_config->>'url',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'User-Agent', 'Supabase Scheduled Action'
            ),
            body := payload,
            method := COALESCE(scheduled_action.action_config->>'method', 'POST')::text
          );
      END CASE;
      
      -- Marcar como concluído
      UPDATE scheduled_actions
      SET status = 'completed'
      WHERE id = scheduled_action.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Em caso de erro, marcar como falha
      UPDATE scheduled_actions
      SET status = 'failed'
      WHERE id = scheduled_action.id;
    END;
  END LOOP;
END;
$$;

-- Certifique-se de que as permissões estão corretamente configuradas
GRANT EXECUTE ON FUNCTION process_scheduled_actions() TO service_role;
GRANT EXECUTE ON FUNCTION check_scheduled_actions() TO postgres;
