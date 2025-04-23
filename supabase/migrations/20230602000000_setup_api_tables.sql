
-- Tabela para armazenar tokens de API
CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para registrar uso da API
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES api_tokens(id),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionando colunas para campos de contato na tabela oportunidades
-- Apenas se elas ainda não existirem
DO $$ 
BEGIN
  -- Adiciona coluna company se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'company'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN company TEXT;
  END IF;

  -- Adiciona coluna phone se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'phone'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN phone TEXT;
  END IF;

  -- Adiciona coluna email se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'email'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN email TEXT;
  END IF;
END $$;
