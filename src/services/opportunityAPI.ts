
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, OpportunityFormData } from "@/types";
import { mapDbOpportunityToOpportunity } from "./utils/mappers";
import { triggerEntityWebhooks } from "./utils/webhook";
import { checkAndMigrateOpportunity } from "./utils/opportunityMigration";
import { stageAPI } from "./stageAPI";
import { stageHistoryAPI } from "./stageHistoryAPI";

export const opportunityAPI = {
  // Método otimizado que busca oportunidades com dados relacionados em uma única query
  getAllWithRelations: async (includeArchived: boolean = false): Promise<{
    opportunities: Opportunity[];
    funnels: any[];
    stages: any[];
  }> => {
    let opportunityQuery = supabase.from('opportunities').select(`
      *,
      stages!inner(id, name, funnel_id, color),
      funnels!inner(id, name)
    `);
    
    if (!includeArchived) {
      opportunityQuery = opportunityQuery.eq('archived', false);
    }
    
    const [opportunitiesResult, funnelsResult, stagesResult] = await Promise.all([
      opportunityQuery.order('created_at', { ascending: false }),
      supabase.from('funnels').select('*').order('order', { ascending: true }),
      supabase.from('stages').select('*').order('order', { ascending: true })
    ]);
    
    if (opportunitiesResult.error) throw opportunitiesResult.error;
    if (funnelsResult.error) throw funnelsResult.error;
    if (stagesResult.error) throw stagesResult.error;
    
    return {
      opportunities: (opportunitiesResult.data || []).map(mapDbOpportunityToOpportunity),
      funnels: funnelsResult.data || [],
      stages: stagesResult.data || []
    };
  },

  getAll: async (includeArchived: boolean = false): Promise<Opportunity[]> => {
    let query = supabase.from('opportunities').select('*');
    
    if (!includeArchived) {
      query = query.eq('archived', false);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getArchived: async (): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities')
      .select('*')
      .eq('archived', true)
      .order('archived_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getByStageId: async (stageId: string, includeArchived: boolean = false): Promise<Opportunity[]> => {
    let query = supabase.from('opportunities').select('*').eq('stage_id', stageId);
    
    if (!includeArchived) {
      query = query.eq('archived', false);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbOpportunityToOpportunity);
  },

  getById: async (id: string): Promise<Opportunity | null> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbOpportunityToOpportunity(data);
  },

  archive: async (id: string): Promise<boolean> => {
    console.log("Archiving opportunity:", id);
    
    const { error } = await supabase.from('opportunities')
      .update({ 
        archived: true, 
        archived_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error archiving opportunity:", error);
      return false;
    }
    
    return true;
  },

  unarchive: async (id: string): Promise<boolean> => {
    console.log("Unarchiving opportunity:", id);
    
    const { error } = await supabase.from('opportunities')
      .update({ 
        archived: false, 
        archived_at: null 
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error unarchiving opportunity:", error);
      return false;
    }
    
    return true;
  },

  create: async (data: OpportunityFormData & { sourceOpportunityId?: string }): Promise<Opportunity> => {
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
      last_stage_change_at: currentTime,
      source_opportunity_id: data.sourceOpportunityId,
      user_id: data.userId
    }]).select().single();
    
    if (error || !created) {
      console.error("Error creating opportunity:", error);
      throw error || new Error('Opportunity create error');
    }
    
    // Registrar entrada inicial no funil
    await stageHistoryAPI.recordStageMove(
      created.id,
      null, // from_stage_id é null para entrada inicial
      data.stageId,
      data.userId
    );
    
    await triggerEntityWebhooks('opportunity', created.id, 'create', created);
    
    return mapDbOpportunityToOpportunity(created);
  },

  update: async (id: string, data: Partial<OpportunityFormData> & { sourceOpportunityId?: string; funnelId?: string }): Promise<Opportunity | null> => {
    console.log("Updating opportunity:", id, "with data:", data);
    
    const dbData: any = {};
    
    if (data.title !== undefined) dbData.title = data.title;
    if (data.client !== undefined) dbData.client = data.client;
    if (data.value !== undefined) dbData.value = data.value;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.company !== undefined) dbData.company = data.company;
    if (data.customFields !== undefined) dbData.custom_fields = data.customFields;
    if (data.sourceOpportunityId !== undefined) dbData.source_opportunity_id = data.sourceOpportunityId;
    if (data.funnelId !== undefined) dbData.funnel_id = data.funnelId;
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
    
    // Buscar etapa atual antes da movimentação
    const { data: currentOpp, error: currentError } = await supabase
      .from('opportunities')
      .select('stage_id, user_id')
      .eq('id', id)
      .single();
    
    if (currentError) {
      console.error("Error fetching current opportunity:", currentError);
      throw currentError;
    }
    
    const currentStageId = currentOpp.stage_id;
    
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
    
    // Registrar movimentação no histórico
    await stageHistoryAPI.recordStageMove(
      id,
      currentStageId,
      newStageId,
      currentOpp.user_id
    );
    
    const opportunity = mapDbOpportunityToOpportunity(updated);
    
    // Check if the destination stage has migration configured
    try {
      const destinationStage = await stageAPI.getById(newStageId);
      if (destinationStage) {
        await checkAndMigrateOpportunity(opportunity, destinationStage);
      }
    } catch (migrationError) {
      console.error("Error in migration check:", migrationError);
      // Don't fail the move operation if migration fails
    }
    
    await triggerEntityWebhooks('opportunity', id, 'move', {
      ...updated,
      previousStageId: currentStageId,
      newStageId: newStageId
    });
    
    return opportunity;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    return !error;
  }
};
