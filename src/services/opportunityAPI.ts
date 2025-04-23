
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, OpportunityFormData } from "@/types";
import { mapDbOpportunityToOpportunity } from "./utils/mappers";
import { scheduledActionAPI } from "./scheduledActionAPI";
import { triggerEntityWebhooks } from "./utils/webhook";

export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    const opportunityBases = (data || []).map(mapDbOpportunityToOpportunity);
    const opportunities: Opportunity[] = [];
    
    for (const opportunityBase of opportunityBases) {
      const scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunityBase.id);
      opportunities.push({
        ...opportunityBase,
        scheduledActions
      });
    }
    
    return opportunities;
  },

  getByStageId: async (stageId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('stage_id', stageId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    const opportunityBases = (data || []).map(mapDbOpportunityToOpportunity);
    const opportunities: Opportunity[] = [];
    
    for (const opportunityBase of opportunityBases) {
      const scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunityBase.id);
      opportunities.push({
        ...opportunityBase,
        scheduledActions
      });
    }
    
    return opportunities;
  },

  getByFunnelId: async (funnelId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('funnel_id', funnelId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    const opportunityBases = (data || []).map(mapDbOpportunityToOpportunity);
    const opportunities: Opportunity[] = [];
    
    for (const opportunityBase of opportunityBases) {
      const scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunityBase.id);
      opportunities.push({
        ...opportunityBase,
        scheduledActions
      });
    }
    
    return opportunities;
  },

  getById: async (id: string): Promise<Opportunity | null> => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    
    const opportunityBase = mapDbOpportunityToOpportunity(data);
    const scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return {
      ...opportunityBase,
      scheduledActions
    };
  },

  create: async (data: OpportunityFormData): Promise<Opportunity> => {
    // Make sure we're explicitly passing all fields
    const { data: created, error } = await supabase.from('opportunities').insert([{
      title: data.title,
      value: data.value,
      client: data.client,
      stage_id: data.stageId,
      funnel_id: data.funnelId,
      company: data.company || null,
      phone: data.phone || null,
      email: data.email || null
    }]).select().single();
    
    if (error || !created) throw error || new Error("Opportunity create error");
    
    const opportunityBase = mapDbOpportunityToOpportunity(created);
    
    await triggerEntityWebhooks('opportunity', created.id, 'create', created);
    
    return {
      ...opportunityBase,
      scheduledActions: []
    };
  },

  update: async (id: string, data: Partial<OpportunityFormData>): Promise<Opportunity | null> => {
    // Ensure we're correctly handling all fields for DB update
    const dbData: any = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.client !== undefined && { client: data.client }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
    };
    
    if (data.stageId !== undefined) {
      dbData.stage_id = data.stageId;
    }
    if (data.funnelId !== undefined) {
      dbData.funnel_id = data.funnelId;
    }
    
    const { data: updated, error } = await supabase.from('opportunities').update(dbData).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks(
      'opportunity',
      id,
      data.stageId ? 'move' : 'update',
      updated
    );
    
    const opportunityBase = mapDbOpportunityToOpportunity(updated);
    const scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return {
      ...opportunityBase,
      scheduledActions
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    return !error;
  },

  move: async (id: string, newStageId: string): Promise<Opportunity | null> => {
    const { data: updated, error } = await supabase.from('opportunities').update({ stage_id: newStageId }).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks('opportunity', id, 'move', updated);
    
    const opportunityBase = mapDbOpportunityToOpportunity(updated);
    const scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return {
      ...opportunityBase,
      scheduledActions
    };
  }
};
