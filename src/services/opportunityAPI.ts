
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, OpportunityFormData } from "@/types";
import { mapDbOpportunityToOpportunity } from "./utils/mappers";
import { triggerEntityWebhooks } from "./utils/webhook";

export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getByStageId: async (stageId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('stage_id', stageId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getById: async (id: string): Promise<Opportunity | null> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbOpportunityToOpportunity(data);
  },

  create: async (data: OpportunityFormData): Promise<Opportunity> => {
    console.log("Creating opportunity with data:", data);
    
    const currentTime = new Date().toISOString();
    const { data: created, error } = await supabase.from('opportunities').insert([{ 
      title: data.title,
      client: data.client,
      value: data.value || 0,
      stage_id: data.stageId,
      funnel_id: data.funnelId,
      phone: data.phone,
      email: data.email,
      company: data.company,
      custom_fields: data.customFields || {},
      last_stage_change_at: currentTime
    }]).select().single();
    
    if (error || !created) {
      console.error("Error creating opportunity:", error);
      throw error || new Error('Opportunity create error');
    }
    
    await triggerEntityWebhooks('opportunity', created.id, 'create', created);
    
    return mapDbOpportunityToOpportunity(created);
  },

  update: async (id: string, data: Partial<OpportunityFormData>): Promise<Opportunity | null> => {
    console.log("Updating opportunity:", id, "with data:", data);
    
    const dbData: any = {};
    
    if (data.title !== undefined) dbData.title = data.title;
    if (data.client !== undefined) dbData.client = data.client;
    if (data.value !== undefined) dbData.value = data.value;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.company !== undefined) dbData.company = data.company;
    if (data.customFields !== undefined) dbData.custom_fields = data.customFields;
    if (data.stageId !== undefined) {
      dbData.stage_id = data.stageId;
      dbData.last_stage_change_at = new Date().toISOString();
    }
    
    const { data: updated, error } = await supabase.from('opportunities').update(dbData).eq('id', id).select().single();
    
    if (error) {
      console.error("Error updating opportunity:", error);
      return null;
    }
    
    if (!updated) {
      console.error("No opportunity data returned after update");
      return null;
    }
    
    await triggerEntityWebhooks('opportunity', id, 'update', updated);
    
    return mapDbOpportunityToOpportunity(updated);
  },

  move: async (id: string, newStageId: string): Promise<Opportunity | null> => {
    console.log(`Moving opportunity ${id} to stage ${newStageId}`);
    
    const currentTime = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from('opportunities')
      .update({ 
        stage_id: newStageId,
        last_stage_change_at: currentTime
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error moving opportunity:", error);
      throw error;
    }
    
    if (!updated) {
      console.error("No opportunity data returned after move");
      throw new Error("Failed to move opportunity");
    }
    
    await triggerEntityWebhooks('opportunity', id, 'move', {
      ...updated,
      previousStageId: undefined, // We don't track the previous stage in this simple implementation
      newStageId: newStageId
    });
    
    return mapDbOpportunityToOpportunity(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    return !error;
  }
};
