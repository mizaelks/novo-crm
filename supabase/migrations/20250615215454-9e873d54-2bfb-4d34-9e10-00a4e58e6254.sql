
-- Criar tabela para armazenar configurações de permissões customizadas
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id text NOT NULL,
  permission_name text NOT NULL,
  description text,
  admin_access boolean DEFAULT true,
  manager_access boolean DEFAULT false,
  user_access boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(permission_id)
);

-- Habilitar RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Política para visualizar permissões (todos os usuários autenticados)
CREATE POLICY "Anyone can view role permissions" 
  ON public.role_permissions 
  FOR SELECT 
  USING (true);

-- Política para admins editarem permissões
CREATE POLICY "Admins can manage role permissions" 
  ON public.role_permissions 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Inserir permissões padrão
INSERT INTO public.role_permissions (permission_id, permission_name, description, admin_access, manager_access, user_access) VALUES
('view_all_opportunities', 'Visualizar todas as oportunidades', 'Pode ver oportunidades de todos os usuários', true, true, false),
('view_own_opportunities', 'Visualizar próprias oportunidades', 'Pode ver apenas suas próprias oportunidades', true, true, true),
('view_shared_funnels', 'Visualizar oportunidades em funis compartilhados', 'Pode ver oportunidades em funis marcados como compartilhados', true, true, true),
('create_opportunities', 'Criar oportunidades', 'Pode criar novas oportunidades', true, true, true),
('edit_all_opportunities', 'Editar todas as oportunidades', 'Pode editar qualquer oportunidade do sistema', true, true, false),
('edit_own_opportunities', 'Editar próprias oportunidades', 'Pode editar apenas suas próprias oportunidades', true, true, true),
('delete_opportunities', 'Excluir oportunidades', 'Pode excluir oportunidades (apenas próprias para usuários)', true, false, true),
('manage_funnels', 'Gerenciar funis', 'Pode criar, editar e configurar funis', true, true, false),
('share_funnels', 'Compartilhar funis', 'Pode marcar funis como compartilhados', true, true, false),
('manage_stages', 'Gerenciar estágios', 'Pode criar, editar e configurar estágios dos funis', true, true, false),
('delete_funnels', 'Excluir funis', 'Pode excluir funis do sistema', true, false, false),
('manage_users', 'Gerenciar usuários', 'Pode criar, editar e excluir usuários', true, false, false),
('manage_roles', 'Gerenciar roles', 'Pode alterar papéis de outros usuários', true, false, false),
('system_settings', 'Configurações do sistema', 'Acesso às configurações avançadas do sistema', true, true, false),
('automation_settings', 'Automação e arquivamento', 'Pode configurar automações e políticas de arquivamento', true, true, false),
('view_reports', 'Visualizar relatórios e insights', 'Acesso aos relatórios e análises do sistema', true, true, true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION update_role_permissions_updated_at();
