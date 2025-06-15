
-- Adicionar coluna tipo ao funil
ALTER TABLE public.funnels 
ADD COLUMN funnel_type TEXT NOT NULL DEFAULT 'venda';

-- Adicionar constraint para garantir valores válidos
ALTER TABLE public.funnels 
ADD CONSTRAINT check_funnel_type 
CHECK (funnel_type IN ('venda', 'relacionamento'));

-- Atualizar funis existentes para serem do tipo 'venda' por padrão
UPDATE public.funnels 
SET funnel_type = 'venda' 
WHERE funnel_type IS NULL;
