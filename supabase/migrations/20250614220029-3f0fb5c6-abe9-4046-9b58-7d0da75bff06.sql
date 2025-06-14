
-- Verificar se a coluna alert_config existe e garantir que está corretamente configurada
DO $$ 
BEGIN
    -- Verificar se a coluna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'stages' 
        AND column_name = 'alert_config'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna se não existir
        ALTER TABLE public.stages ADD COLUMN alert_config JSONB;
        RAISE NOTICE 'Coluna alert_config adicionada à tabela stages';
    ELSE
        RAISE NOTICE 'Coluna alert_config já existe na tabela stages';
    END IF;
    
    -- Garantir que a coluna aceita NULL (para etapas sem configuração de alerta)
    ALTER TABLE public.stages ALTER COLUMN alert_config DROP NOT NULL;
    
    -- Adicionar comentário explicativo
    COMMENT ON COLUMN public.stages.alert_config IS 'Configuração de alertas da etapa em formato JSON: {enabled: boolean, maxDaysInStage: number, alertMessage?: string}';
END $$;

-- Verificar se a coluna last_stage_change_at existe na tabela opportunities
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'opportunities' 
        AND column_name = 'last_stage_change_at'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna se não existir
        ALTER TABLE public.opportunities ADD COLUMN last_stage_change_at TIMESTAMPTZ;
        
        -- Definir valores iniciais para oportunidades existentes
        UPDATE public.opportunities 
        SET last_stage_change_at = created_at 
        WHERE last_stage_change_at IS NULL;
        
        RAISE NOTICE 'Coluna last_stage_change_at adicionada à tabela opportunities';
    ELSE
        RAISE NOTICE 'Coluna last_stage_change_at já existe na tabela opportunities';
    END IF;
    
    -- Adicionar comentário explicativo
    COMMENT ON COLUMN public.opportunities.last_stage_change_at IS 'Timestamp de quando a oportunidade foi movida para a etapa atual (usado para calcular alertas)';
END $$;

-- Verificar e garantir que não há constraint que impeça valores NULL em alert_config
ALTER TABLE public.stages ALTER COLUMN alert_config DROP NOT NULL;
