
-- Add color and status fields to stages
ALTER TABLE public.stages 
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#CCCCCC',
  ADD COLUMN IF NOT EXISTS is_win_stage BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_loss_stage BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS required_fields JSONB DEFAULT '[]'::jsonb;

-- Add custom_fields field to opportunities
ALTER TABLE public.opportunities 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- Create webhook templates table
CREATE TABLE IF NOT EXISTS public.webhook_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  target_type TEXT NOT NULL,  -- 'funnel', 'stage', 'opportunity'
  event TEXT NOT NULL,        -- 'create', 'update', 'move'
  payload TEXT NOT NULL,      -- JSON template as text
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add template_id field to scheduled_actions
ALTER TABLE public.scheduled_actions
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.webhook_templates(id);
