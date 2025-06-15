
-- Primeiro, vamos identificar e corrigir os dados existentes
-- Atualizar oportunidades sem user_id para um usuário admin existente
UPDATE public.opportunities 
SET user_id = (
  SELECT ur.user_id 
  FROM public.user_roles ur 
  WHERE ur.role = 'admin' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Se não houver admin, criar um usuário padrão temporário
-- (isso não deveria acontecer, mas é uma proteção)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.opportunities WHERE user_id IS NOT NULL) THEN
    -- Se todas as oportunidades ainda estão NULL, usar o primeiro usuário disponível
    UPDATE public.opportunities 
    SET user_id = (
      SELECT id 
      FROM public.profiles 
      LIMIT 1
    )
    WHERE user_id IS NULL;
  END IF;
END $$;

-- Agora aplicar as políticas RLS e mudanças estruturais
-- Adicionar campo de compartilhamento nos funis
ALTER TABLE public.funnels ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false;

-- Remover políticas RLS existentes muito permissivas
DROP POLICY IF EXISTS "Users can view all opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can view all funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can view stages of accessible funnels" ON public.stages;

-- Função para verificar se um funil é compartilhado
CREATE OR REPLACE FUNCTION public.is_funnel_shared(funnel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(is_shared, false) FROM public.funnels WHERE id = funnel_id;
$$;

-- Função para verificar se usuário pode ver oportunidade
CREATE OR REPLACE FUNCTION public.can_view_opportunity(opportunity_user_id uuid, opportunity_funnel_id uuid, current_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    -- Admin ou manager pode ver tudo
    public.has_role(current_user_id, 'admin') OR 
    public.has_role(current_user_id, 'manager') OR
    -- Proprietário da oportunidade
    opportunity_user_id = current_user_id OR
    -- Funil compartilhado
    public.is_funnel_shared(opportunity_funnel_id);
$$;

-- NOVA POLÍTICA RLS PARA OPPORTUNITIES - Mais restritiva
CREATE POLICY "Users can view authorized opportunities" 
  ON public.opportunities 
  FOR SELECT 
  TO authenticated
  USING (
    public.can_view_opportunity(user_id, funnel_id, auth.uid())
  );

-- Política para inserção (usuário só pode criar para si mesmo)
CREATE POLICY "Users can create own opportunities" 
  ON public.opportunities 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para atualização (só próprias oportunidades ou managers/admins)
CREATE POLICY "Users can update authorized opportunities" 
  ON public.opportunities 
  FOR UPDATE 
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager') OR
    auth.uid() = user_id
  );

-- Política para deleção (só próprias oportunidades ou admins)
CREATE POLICY "Users can delete authorized opportunities" 
  ON public.opportunities 
  FOR DELETE 
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    auth.uid() = user_id
  );

-- POLÍTICAS PARA FUNIS - Todos podem ver, mas só managers/admins podem modificar
CREATE POLICY "Users can view all funnels" 
  ON public.funnels 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Managers can modify funnels" 
  ON public.funnels 
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

-- POLÍTICAS PARA STAGES - Baseadas no acesso ao funil
CREATE POLICY "Users can view funnel stages" 
  ON public.stages 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Managers can modify stages" 
  ON public.stages 
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

-- POLÍTICAS PARA PROFILES - Usuários veem perfis de oportunidades que podem acessar
CREATE POLICY "Users can view accessible profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (
    -- Admins e managers veem todos
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager') OR
    -- Próprio perfil
    auth.uid() = id OR
    -- Perfis de usuários com oportunidades em funis compartilhados que o usuário pode ver
    EXISTS (
      SELECT 1 FROM public.opportunities o 
      WHERE o.user_id = profiles.id 
      AND public.can_view_opportunity(o.user_id, o.funnel_id, auth.uid())
    )
  );

-- Agora sim, tornar user_id obrigatório (após garantir que não há valores NULL)
ALTER TABLE public.opportunities ALTER COLUMN user_id SET NOT NULL;
