
-- Criar tabela para armazenar tarefas obrigatórias das etapas
CREATE TABLE public.required_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_duration INTEGER DEFAULT 1, -- Duração padrão em horas
  template_id TEXT, -- ID do template de tarefa (como 'ligar', 'whatsapp', etc.)
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índice para melhor performance
CREATE INDEX idx_required_tasks_stage_id ON public.required_tasks(stage_id);

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_required_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_required_tasks_updated_at
  BEFORE UPDATE ON public.required_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_required_tasks_updated_at();

-- Adicionar coluna para rastrear tarefas obrigatórias completadas nas oportunidades
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS required_tasks_completed JSONB DEFAULT '[]'::jsonb;

-- Comentários para documentação
COMMENT ON TABLE public.required_tasks IS 'Armazena tarefas obrigatórias configuradas para cada etapa';
COMMENT ON COLUMN public.required_tasks.template_id IS 'ID do template de tarefa padrão (ligar, whatsapp, email, etc.)';
COMMENT ON COLUMN public.required_tasks.default_duration IS 'Duração padrão em horas para agendar a tarefa';
COMMENT ON COLUMN public.opportunities.required_tasks_completed IS 'Array de IDs das tarefas obrigatórias que foram completadas para esta oportunidade';
