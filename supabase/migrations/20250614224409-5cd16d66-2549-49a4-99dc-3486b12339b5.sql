
-- Update the check constraint to allow 'task' action type
ALTER TABLE scheduled_actions DROP CONSTRAINT IF EXISTS scheduled_actions_action_type_check;

ALTER TABLE scheduled_actions ADD CONSTRAINT scheduled_actions_action_type_check 
CHECK (action_type IN ('email', 'webhook', 'task'));
