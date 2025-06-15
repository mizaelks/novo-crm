
-- Primeiro, vamos verificar os funis existentes e seus tipos
-- Depois vamos atualizar os funis que deveriam ser de relacionamento

-- Assumindo que os funis de relacionamento são aqueles que não focam em vendas
-- Vou atualizar alguns funis para serem de relacionamento baseado em nomes típicos
UPDATE funnels 
SET funnel_type = 'relacionamento' 
WHERE name ILIKE '%relacionamento%' 
   OR name ILIKE '%networking%' 
   OR name ILIKE '%parceria%' 
   OR name ILIKE '%contato%'
   OR name ILIKE '%lead%nurturing%';

-- Se você souber os IDs específicos dos funis que deveriam ser de relacionamento,
-- pode me informar e eu atualizo especificamente esses IDs
