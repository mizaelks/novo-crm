
import { supabase } from "@/integrations/supabase/client";
import { Stage, StageFormData } from "@/types";
import { mapDbStageToStage } from "./utils/mappers";
import { opportunityAPI } from "./opportunityAPI";
import { triggerEntityWebhooks } from "./utils/webhook";

export const stageAPI = {
  getAll: async (): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').order('order', { ascending: true });
    if (error) throw error;
    
    const stageBases = (data || []).map(mapDbStageToStage);
    const stages: Stage[] = [];
    
    for (const stageBase of stageBases) {
      const opportunities = await opportunityAPI.getByStageId(stageBase.id);
      stages.push({
        ...stageBase,
        opportunities
      });
    }
    
    return stages;
  },

  getByFunnelId: async (funnelId: string): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').eq('funnel_id', funnelId).order('order', { ascending: true });
    if (error) throw error;
    
    const stageBases = (data || []).map(mapDbStageToStage);
    const stages: Stage[] = [];
    
    for (const stageBase of stageBases) {
      const opportunities = await opportunityAPI.getByStageId(stageBase.id);
      stages.push({
        ...stageBase,
        opportunities
      });
    }
    
    return stages;
  },

  getById: async (id: string): Promise<Stage | null> => {
    const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    const stageBase = mapDbStageToStage(data);
    const opportunities = await opportunityAPI.getByStageId(id);
    
    return {
      ...stageBase,
      opportunities
    };
  },

  create: async (data: StageFormData): Promise<Stage> => {
    const { data: created, error } = await supabase.from('stages').insert([{ 
      name: data.name, 
      description: data.description, 
      funnel_id: data.funnelId,
      color: data.color || '#CCCCCC',
      is_win_stage: data.isWinStage || false,
      is_loss_stage: data.isLossStage || false
    }]).select().single();
    
    if (error || !created) throw error || new Error('Stage create error');
    
    const stageBase = mapDbStageToStage(created);
    
    await triggerEntityWebhooks('stage', created.id, 'create', created);
    
    return {
      ...stageBase,
      opportunities: []
    };
  },

  update: async (id: string, data: Partial<StageFormData>): Promise<Stage | null> => {
    const dbData: any = {};
    
    if (data.name !== undefined) dbData.name = data.name;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.color !== undefined) dbData.color = data.color;
    if (data.isWinStage !== undefined) dbData.is_win_stage = data.isWinStage;
    if (data.isLossStage !== undefined) dbData.is_loss_stage = data.isLossStage;
    
    if (data.funnelId !== undefined) {
      dbData.funnel_id = data.funnelId;
    }
    
    const { data: updated, error } = await supabase.from('stages').update(dbData).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks('stage', id, 'update', updated);
    
    const stageBase = mapDbStageToStage(updated);
    const opportunities = await opportunityAPI.getByStageId(id);
    
    return {
      ...stageBase,
      opportunities
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('stages').delete().eq('id', id);
    return !error;
  }
};
