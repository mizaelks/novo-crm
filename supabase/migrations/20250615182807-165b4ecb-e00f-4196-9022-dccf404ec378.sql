
-- Adicionar campos de arquivamento na tabela opportunities
ALTER TABLE public.opportunities 
ADD COLUMN archived boolean NOT NULL DEFAULT false,
ADD COLUMN archived_at timestamp with time zone;

-- Criar índice para melhor performance nas consultas de oportunidades arquivadas
CREATE INDEX idx_opportunities_archived ON public.opportunities(archived);

-- Criar índice composto para consultas por funil/etapa excluindo arquivadas
CREATE INDEX idx_opportunities_active_stage ON public.opportunities(stage_id, funnel_id) WHERE archived = false;
