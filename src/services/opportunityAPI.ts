
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, OpportunityFormData } from "@/types";
import { mapDbOpportunityToOpportunity } from "./utils/mappers";
import { Json } from '@/integrations/supabase/types';

export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*');
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getByFunnelId: async (funnelId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('funnel_id', funnelId);
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getByStageId: async (stageId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('stage_id', stageId);
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getById: async (id: string): Promise<Opportunity | null> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbOpportunityToOpportunity(data);
  },

  create: async (data: OpportunityFormData): Promise<Opportunity> => {
    // Convert customFields to JSON format for DB
    const { data: created, error } = await supabase.from('opportunities').insert({
      title: data.title,
      value: data.value,
      client: data.client,
      stage_id: data.stageId,
      funnel_id: data.funnelId,
      phone: data.phone,
      email: data.email,
      company: data.company,
      custom_fields: data.customFields as Json
    }).select().single();
    
    if (error || !created) throw error || new Error("Opportunity create failed");
    return mapDbOpportunityToOpportunity(created);
  },

  update: async (id: string, data: Partial<OpportunityFormData>): Promise<Opportunity | null> => {
    const updateData: Record<string, any> = {};
    
    // Only add fields that are defined
    if (data.title !== undefined) updateData.title = data.title;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.client !== undefined) updateData.client = data.client;
    if (data.stageId !== undefined) updateData.stage_id = data.stageId;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.customFields !== undefined) updateData.custom_fields = data.customFields as Json;

    const { data: updated, error } = await supabase.from('opportunities').update(updateData).eq('id', id).select().single();
    if (error || !updated) return null;
    return mapDbOpportunityToOpportunity(updated);
  },

  move: async (id: string, newStageId: string): Promise<Opportunity | null> => {
    try {
      // First, get the current opportunity with ALL its data
      const { data: currentOpportunity, error: fetchError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !currentOpportunity) {
        console.error("Failed to fetch current opportunity data:", fetchError);
        return null;
      }
      
      console.log("Current opportunity data before move:", currentOpportunity);
      console.log("Custom fields before move:", currentOpportunity.custom_fields);
      
      // Preserve all fields, especially custom_fields, when updating
      const { data: updated, error: updateError } = await supabase
        .from('opportunities')
        .update({ 
          stage_id: newStageId,
          custom_fields: currentOpportunity.custom_fields // Explicitly keep the custom fields
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (updateError || !updated) {
        console.error("Failed to move opportunity:", updateError);
        return null;
      }
      
      console.log("Updated opportunity after move:", updated);
      console.log("Custom fields after move:", updated.custom_fields);
      
      // Verify the returned opportunity has the expected data
      return mapDbOpportunityToOpportunity(updated);
    } catch (error) {
      console.error("Exception during move operation:", error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    return !error;
  }
};
