
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, OpportunityFormData, ScheduledAction } from "@/types";
import { parseJSON } from "date-fns";
import { mapDbOpportunityToOpportunity } from "./utils/mappers";
import { scheduledActionAPI } from "./scheduledActionAPI";
import { triggerEntityWebhooks } from "./utils/webhook";

export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert DB rows to Opportunity objects
    const opportunities = (data || []).map(mapDbOpportunityToOpportunity);
    
    // Load scheduled actions for each opportunity
    for (const opportunity of opportunities) {
      opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
    }
    
    return opportunities;
  },

  getByFunnelId: async (funnelId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities')
      .select('*')
      .eq('funnel_id', funnelId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert DB rows to Opportunity objects
    const opportunities = (data || []).map(mapDbOpportunityToOpportunity);
    
    // Load scheduled actions for each opportunity
    for (const opportunity of opportunities) {
      opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
    }
    
    return opportunities;
  },

  getByStageId: async (stageId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities')
      .select('*')
      .eq('stage_id', stageId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert DB rows to Opportunity objects
    const opportunities = (data || []).map(mapDbOpportunityToOpportunity);
    
    // Load scheduled actions for each opportunity
    for (const opportunity of opportunities) {
      opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
    }
    
    return opportunities;
  },

  getById: async (id: string): Promise<Opportunity | null> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
    
    if (error || !data) return null;
    
    const opportunity = mapDbOpportunityToOpportunity(data);
    opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return opportunity;
  },

  create: async (data: OpportunityFormData): Promise<Opportunity | null> => {
    console.log("Criando oportunidade com os dados:", data);
    
    const { data: created, error } = await supabase.from('opportunities').insert([{ 
      title: data.title, 
      value: data.value, 
      client: data.client, 
      stage_id: data.stageId,
      funnel_id: data.funnelId,
      phone: data.phone,
      email: data.email,
      company: data.company,
      custom_fields: data.customFields || {}
    }]).select().single();
    
    if (error || !created) {
      console.error("Erro ao criar oportunidade:", error);
      return null;
    }
    
    await triggerEntityWebhooks('opportunity', created.id, 'create', created);
    
    const opportunity = mapDbOpportunityToOpportunity(created);
    opportunity.scheduledActions = [];
    
    return opportunity;
  },

  update: async (id: string, data: Partial<OpportunityFormData>): Promise<Opportunity | null> => {
    console.log("Atualizando oportunidade:", id);
    console.log("Dados a atualizar:", data);
    
    // Prepare data to update
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.client !== undefined) updateData.client = data.client;
    if (data.stageId !== undefined) updateData.stage_id = data.stageId;
    if (data.funnelId !== undefined) updateData.funnel_id = data.funnelId;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.company !== undefined) updateData.company = data.company;
    
    // Handle custom fields separately to ensure proper JSON format
    if (data.customFields !== undefined) {
      // Certifica-se de que customFields é um objeto válido
      updateData.custom_fields = data.customFields;
    }
    
    console.log("Dados formatados para atualização:", updateData);
    
    const { data: updated, error } = await supabase.from('opportunities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar oportunidade:", error);
      return null;
    }
    
    if (!updated) {
      console.error("Oportunidade não encontrada para atualização");
      return null;
    }
    
    console.log("Oportunidade atualizada com sucesso:", updated);
    
    const wasStageChanged = data.stageId && data.stageId !== updated.stage_id;
    if (wasStageChanged) {
      await triggerEntityWebhooks('opportunity', id, 'move', updated);
    } else {
      await triggerEntityWebhooks('opportunity', id, 'update', updated);
    }
    
    const opportunity = mapDbOpportunityToOpportunity(updated);
    opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return opportunity;
  },

  delete: async (id: string): Promise<boolean> => {
    // First, delete all scheduled actions for this opportunity
    const actions = await scheduledActionAPI.getByOpportunityId(id);
    for (const action of actions) {
      await scheduledActionAPI.delete(action.id);
    }
    
    // Then delete the opportunity
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    return !error;
  }
};
