
-- Create opportunity_stage_history table
CREATE TABLE public.opportunity_stage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
  to_stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  moved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_opportunity_stage_history_opportunity_id ON public.opportunity_stage_history(opportunity_id);
CREATE INDEX idx_opportunity_stage_history_to_stage_id ON public.opportunity_stage_history(to_stage_id);
CREATE INDEX idx_opportunity_stage_history_moved_at ON public.opportunity_stage_history(moved_at);

-- Enable RLS
ALTER TABLE public.opportunity_stage_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (allow all authenticated users to read)
CREATE POLICY "Allow authenticated users to view stage history" 
  ON public.opportunity_stage_history 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create RLS policy for insert (allow authenticated users to insert)
CREATE POLICY "Allow authenticated users to insert stage history" 
  ON public.opportunity_stage_history 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Migrate existing data: create initial stage entries for all opportunities
INSERT INTO public.opportunity_stage_history (opportunity_id, from_stage_id, to_stage_id, moved_at, user_id)
SELECT 
  o.id as opportunity_id,
  NULL as from_stage_id, -- NULL indicates initial stage entry
  o.stage_id as to_stage_id,
  COALESCE(o.last_stage_change_at, o.created_at) as moved_at,
  o.user_id
FROM public.opportunities o
WHERE o.stage_id IS NOT NULL;
