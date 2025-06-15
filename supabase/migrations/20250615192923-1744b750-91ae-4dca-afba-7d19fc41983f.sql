
-- Habilitar RLS nas tabelas principais
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_actions ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar se o usuário tem acesso ao funil
CREATE OR REPLACE FUNCTION public.user_has_funnel_access(funnel_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Por enquanto, todos os usuários autenticados têm acesso a todos os funis
  -- Pode ser expandido para organizações/grupos no futuro
  SELECT user_id IS NOT NULL;
$$;

-- Políticas para OPPORTUNITIES
CREATE POLICY "Users can view all opportunities" 
  ON public.opportunities 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create opportunities" 
  ON public.opportunities 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update opportunities" 
  ON public.opportunities 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete opportunities" 
  ON public.opportunities 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Políticas para FUNNELS
CREATE POLICY "Users can view all funnels" 
  ON public.funnels 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can create funnels" 
  ON public.funnels 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Managers and admins can update funnels" 
  ON public.funnels 
  FOR UPDATE 
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Only admins can delete funnels" 
  ON public.funnels 
  FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para STAGES
CREATE POLICY "Users can view stages of accessible funnels" 
  ON public.stages 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can create stages" 
  ON public.stages 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Managers and admins can update stages" 
  ON public.stages 
  FOR UPDATE 
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Only admins can delete stages" 
  ON public.stages 
  FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para REQUIRED_FIELDS
CREATE POLICY "Users can view required fields" 
  ON public.required_fields 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can manage required fields" 
  ON public.required_fields 
  FOR ALL 
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Políticas para REQUIRED_TASKS
CREATE POLICY "Users can view required tasks" 
  ON public.required_tasks 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can manage required tasks" 
  ON public.required_tasks 
  FOR ALL 
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Políticas para OPPORTUNITY_STAGE_HISTORY
CREATE POLICY "Users can view stage history" 
  ON public.opportunity_stage_history 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "System can create stage history" 
  ON public.opportunity_stage_history 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para SCHEDULED_ACTIONS
CREATE POLICY "Users can view scheduled actions" 
  ON public.scheduled_actions 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create scheduled actions" 
  ON public.scheduled_actions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update scheduled actions" 
  ON public.scheduled_actions 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete scheduled actions" 
  ON public.scheduled_actions 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_opportunities_funnel_id ON public.opportunities(funnel_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage_id ON public.opportunities(stage_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_archived ON public.opportunities(archived);
CREATE INDEX IF NOT EXISTS idx_stages_funnel_id ON public.stages(funnel_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_stage_history_opportunity_id ON public.opportunity_stage_history(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Função para verificar se o usuário atual é o proprietário de uma oportunidade
CREATE OR REPLACE FUNCTION public.is_opportunity_owner(opportunity_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.opportunities 
    WHERE id = opportunity_id 
    AND user_id = auth.uid()
  );
$$;
