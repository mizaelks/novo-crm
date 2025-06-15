
-- Adicionar campo user_id para rastrear quem criou a oportunidade
ALTER TABLE opportunities 
ADD COLUMN user_id uuid REFERENCES auth.users;

-- Adicionar campos de motivo nas etapas
ALTER TABLE stages 
ADD COLUMN win_reason_required boolean DEFAULT false,
ADD COLUMN loss_reason_required boolean DEFAULT false,
ADD COLUMN win_reasons text[] DEFAULT '{}',
ADD COLUMN loss_reasons text[] DEFAULT '{}';

-- Adicionar campos de motivo nas oportunidades
ALTER TABLE opportunities 
ADD COLUMN win_reason text,
ADD COLUMN loss_reason text;

-- Atualizar oportunidades existentes para ter user_id do primeiro admin (opcional)
UPDATE opportunities 
SET user_id = (
  SELECT ur.user_id 
  FROM user_roles ur 
  WHERE ur.role = 'admin' 
  LIMIT 1
) 
WHERE user_id IS NULL;
