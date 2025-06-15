
-- Criar tabela para sugestões de produtos configuráveis
CREATE TABLE public.product_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'produto',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar alguns produtos padrão
INSERT INTO public.product_suggestions (name, description, category) VALUES
('Implementação CRM', 'Sistema de gestão de relacionamento com cliente', 'software'),
('Consultoria em Marketing Digital', 'Consultoria especializada em marketing digital', 'servico'),
('Website Institucional', 'Desenvolvimento de site institucional', 'desenvolvimento'),
('Sistema de Vendas', 'Sistema personalizado para gestão de vendas', 'software'),
('Treinamento em Vendas', 'Capacitação da equipe comercial', 'treinamento'),
('Produto A', 'Produto padrão A da empresa', 'produto'),
('Produto B', 'Produto padrão B da empresa', 'produto'),
('Serviço de Suporte', 'Suporte técnico especializado', 'servico'),
('Auditoria de Processos', 'Análise e otimização de processos', 'consultoria'),
('Licença de Software', 'Licenciamento de software personalizado', 'software');

-- Habilitar RLS (Row Level Security) - como é uma tabela de configuração global, vamos permitir leitura para todos
ALTER TABLE public.product_suggestions ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "Users can view product suggestions" 
  ON public.product_suggestions 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Política para permitir admins criarem/editarem produtos
CREATE POLICY "Admins can manage product suggestions" 
  ON public.product_suggestions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Função para incrementar contador de uso
CREATE OR REPLACE FUNCTION public.increment_product_usage(product_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.product_suggestions 
  SET usage_count = usage_count + 1, updated_at = now()
  WHERE name ILIKE product_name AND is_active = true;
  
  -- Se o produto não existe, criar uma nova sugestão
  IF NOT FOUND THEN
    INSERT INTO public.product_suggestions (name, usage_count, category)
    VALUES (product_name, 1, 'personalizado')
    ON CONFLICT (name) DO UPDATE SET usage_count = usage_count + 1;
  END IF;
END;
$$;
