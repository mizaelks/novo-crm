
-- Create stored procedures to handle webhook templates

-- Get all webhook templates
CREATE OR REPLACE FUNCTION get_webhook_templates()
RETURNS SETOF webhook_templates
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM webhook_templates ORDER BY created_at DESC;
$$;

-- Get webhook template by ID
CREATE OR REPLACE FUNCTION get_webhook_template_by_id(template_id UUID)
RETURNS webhook_templates
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM webhook_templates WHERE id = template_id;
$$;

-- Create webhook template
CREATE OR REPLACE FUNCTION create_webhook_template(
  p_name TEXT,
  p_description TEXT,
  p_url TEXT,
  p_target_type TEXT,
  p_event TEXT,
  p_payload TEXT
)
RETURNS webhook_templates
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_template webhook_templates;
BEGIN
  INSERT INTO webhook_templates (name, description, url, target_type, event, payload)
  VALUES (p_name, p_description, p_url, p_target_type, p_event, p_payload)
  RETURNING * INTO new_template;
  
  RETURN new_template;
END;
$$;

-- Update webhook template
CREATE OR REPLACE FUNCTION update_webhook_template(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_event TEXT DEFAULT NULL,
  p_payload TEXT DEFAULT NULL
)
RETURNS webhook_templates
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_template webhook_templates;
BEGIN
  UPDATE webhook_templates
  SET 
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    url = COALESCE(p_url, url),
    target_type = COALESCE(p_target_type, target_type),
    event = COALESCE(p_event, event),
    payload = COALESCE(p_payload, payload)
  WHERE id = p_id
  RETURNING * INTO updated_template;
  
  RETURN updated_template;
END;
$$;

-- Delete webhook template
CREATE OR REPLACE FUNCTION delete_webhook_template(template_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM webhook_templates WHERE id = template_id;
$$;
