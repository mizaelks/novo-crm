
-- Adicionar coluna price na tabela product_suggestions
ALTER TABLE public.product_suggestions ADD COLUMN price DECIMAL(10,2);

-- Atualizar alguns produtos com preços padrão
UPDATE public.product_suggestions SET price = 5000.00 WHERE name = 'Implementação CRM';
UPDATE public.product_suggestions SET price = 2500.00 WHERE name = 'Consultoria em Marketing Digital';
UPDATE public.product_suggestions SET price = 3000.00 WHERE name = 'Website Institucional';
UPDATE public.product_suggestions SET price = 8000.00 WHERE name = 'Sistema de Vendas';
UPDATE public.product_suggestions SET price = 1500.00 WHERE name = 'Treinamento em Vendas';
UPDATE public.product_suggestions SET price = 1000.00 WHERE name = 'Produto A';
UPDATE public.product_suggestions SET price = 1200.00 WHERE name = 'Produto B';
UPDATE public.product_suggestions SET price = 800.00 WHERE name = 'Serviço de Suporte';
UPDATE public.product_suggestions SET price = 4000.00 WHERE name = 'Auditoria de Processos';
UPDATE public.product_suggestions SET price = 6000.00 WHERE name = 'Licença de Software';
