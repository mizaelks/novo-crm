
import { supabase } from "@/integrations/supabase/client";
import { Stage, StageFormData } from "@/types";
import { mapDbStageToStage } from "./utils/mappers";

export const stageAPI = {
  getAll: async (): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').order('order', { ascending: true });
    if (error) throw error;
    return (data || []).map(stage => ({ ...mapDbStageToStage(stage), opportunities: [] }));
  },

  getByFunnelId: async (funnelId: string): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').eq('funnel_id', funnelId).order('order', { ascending: true });
    if (error) throw error;
    return (data || []).map(stage => ({ ...mapDbStageToStage(stage), opportunities: [] }));
  },

  getById: async (id: string): Promise<Stage | null> => {
    const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
    if (error || !data) return null;
    return { ...mapDbStageToStage(data), opportunities: [] };
  },

  create: async (data: StageFormData): Promise<Stage> => {
    console.log("Creating stage with data:", data);
    
    const insertData = {
      name: data.name,
      description: data.description,
      funnel_id: data.funnelId,
      color: data.color,
      is_win_stage: data.isWinStage || false,
      is_loss_stage: data.isLossStage || false,
      order: data.order || 0,
      alert_config: data.alertConfig || null,
      migrate_config: data.migrateConfig || null,
      win_reason_required: data.winReasonRequired || false,
      loss_reason_required: data.lossReasonRequired || false,
      win_reasons: data.winReasons || [],
      loss_reasons: data.lossReasons || []
    } as any;
    
    const { data: created, error } = await supabase
      .from('stages')
      .insert(insertData)
      .select()
      .single();
    
    if (error || !created) {
      console.error("Error creating stage:", error);
      throw error || new Error('Stage creation failed');
    }
    
    return { ...mapDbStageToStage(created), opportunities: [] };
  },

  update: async (id: string, data: Partial<StageFormData>): Promise<Stage | null> => {
    console.log("Updating stage:", id, "with data:", data);
    
    const dbData: any = {};
    
    if (data.name !== undefined) dbData.name = data.name;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.color !== undefined) dbData.color = data.color;
    if (data.isWinStage !== undefined) dbData.is_win_stage = data.isWinStage;
    if (data.isLossStage !== undefined) dbData.is_loss_stage = data.isLossStage;
    if (data.order !== undefined) dbData.order = data.order;
    if (data.alertConfig !== undefined) dbData.alert_config = data.alertConfig;
    if (data.migrateConfig !== undefined) dbData.migrate_config = data.migrateConfig;
    if (data.winReasonRequired !== undefined) dbData.win_reason_required = data.winReasonRequired;
    if (data.lossReasonRequired !== undefined) dbData.loss_reason_required = data.lossReasonRequired;
    if (data.winReasons !== undefined) dbData.win_reasons = data.winReasons;
    if (data.lossReasons !== undefined) dbData.loss_reasons = data.lossReasons;
    
    const { data: updated, error } = await supabase.from('stages').update(dbData).eq('id', id).select().single();
    
    if (error) {
      console.error("Error updating stage:", error);
      return null;
    }
    
    if (!updated) {
      console.error("No stage data returned after update");
      return null;
    }
    
    return { ...mapDbStageToStage(updated), opportunities: [] };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('stages').delete().eq('id', id);
    return !error;
  },

  updateOrder: async (stages: { id: string; order: number }[]): Promise<boolean> => {
    try {
      for (const stage of stages) {
        const { error } = await supabase
          .from('stages')
          .update({ order: stage.order })
          .eq('id', stage.id);
        
        if (error) {
          console.error("Error updating stage order:", error);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error updating stages order:", error);
      return false;
    }
  }
};
