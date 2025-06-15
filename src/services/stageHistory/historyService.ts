
import { supabase } from "@/integrations/supabase/client";
import { StageHistoryEntry } from "@/types/stageHistory";

export const historyService = {
  // Registrar movimentação de etapa
  recordStageMove: async (
    opportunityId: string, 
    fromStageId: string | null, 
    toStageId: string, 
    userId?: string
  ): Promise<StageHistoryEntry | null> => {
    try {
      const { data, error } = await supabase
        .from('opportunity_stage_history')
        .insert({
          opportunity_id: opportunityId,
          from_stage_id: fromStageId,
          to_stage_id: toStageId,
          user_id: userId || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        opportunityId: data.opportunity_id,
        fromStageId: data.from_stage_id,
        toStageId: data.to_stage_id,
        movedAt: new Date(data.moved_at),
        userId: data.user_id
      };
    } catch (error) {
      console.error("Error recording stage move:", error);
      return null;
    }
  },

  // Buscar histórico de uma oportunidade
  getOpportunityHistory: async (opportunityId: string): Promise<StageHistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('opportunity_stage_history')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('moved_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        opportunityId: item.opportunity_id,
        fromStageId: item.from_stage_id,
        toStageId: item.to_stage_id,
        movedAt: new Date(item.moved_at),
        userId: item.user_id
      }));
    } catch (error) {
      console.error("Error fetching opportunity history:", error);
      return [];
    }
  }
};
