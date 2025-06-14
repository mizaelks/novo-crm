
-- Adicionar campo source_opportunity_id para rastrear oportunidades clonadas
ALTER TABLE public.opportunities 
ADD COLUMN source_opportunity_id uuid REFERENCES public.opportunities(id);

-- Adicionar configuração de migração para funil nas etapas
ALTER TABLE public.stages 
ADD COLUMN migrate_config jsonb;

-- Comentários para documentar os novos campos:
COMMENT ON COLUMN public.opportunities.source_opportunity_id IS 'ID da oportunidade original quando esta foi criada por migração';
COMMENT ON COLUMN public.stages.migrate_config IS 'Configuração de migração automática para outro funil quando oportunidade chega nesta etapa';

-- Exemplo da estrutura do migrate_config:
-- {
--   "enabled": true,
--   "target_funnel_id": "uuid-do-funil-destino",
--   "target_stage_id": "uuid-da-etapa-inicial-destino"
-- }
