
import { supabase } from "@/integrations/supabase/client";
import { StageVelocityData } from "@/types/stageHistory";

export const velocityService = {
  // Calcular velocidade média do funil (dias da primeira à última etapa)
  getFunnelAverageVelocity: async (funnelId: string, dateFrom?: Date, dateTo?: Date): Promise<number> => {
    try {
      // Query simplificada: buscar oportunidades que chegaram às etapas de ganho
      let query = supabase
        .from('opportunity_stage_history')
        .select(`
          opportunity_id,
          moved_at,
          to_stage_id,
          stages!to_stage_id (
            funnel_id,
            is_win_stage
          )
        `)
        .eq('stages.funnel_id', funnelId)
        .eq('stages.is_win_stage', true);

      if (dateFrom) {
        query = query.gte('moved_at', dateFrom.toISOString());
      }
      
      if (dateTo) {
        query = query.lte('moved_at', dateTo.toISOString());
      }

      const { data: winEntries, error } = await query;
      
      if (error) throw error;

      // Add null check for winEntries
      if (!winEntries || !Array.isArray(winEntries) || winEntries.length === 0) return 0;

      // Para cada oportunidade vencedora, buscar a primeira entrada no funil
      const velocities = await Promise.all(
        winEntries.map(async (winEntry: any) => {
          const { data: firstEntry, error: firstError } = await supabase
            .from('opportunity_stage_history')
            .select('moved_at')
            .eq('opportunity_id', winEntry.opportunity_id)
            .is('from_stage_id', null) // primeira entrada
            .single();

          if (firstError || !firstEntry) return null;

          const startDate = new Date(firstEntry.moved_at);
          const endDate = new Date(winEntry.moved_at);
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysDiff;
        })
      );

      const validVelocities = velocities?.filter((v): v is number => v !== null && v > 0) || [];
      
      if (validVelocities.length === 0) return 0;
      
      return validVelocities.reduce((sum, v) => sum + v, 0) / validVelocities.length;
    } catch (error) {
      console.error("Error calculating funnel average velocity:", error);
      return 0;
    }
  },

  // Calcular velocidade de uma etapa específica (tempo médio na etapa)
  getStageVelocity: async (stageId: string, dateFrom?: Date, dateTo?: Date): Promise<StageVelocityData | null> => {
    try {
      // Buscar nome da etapa
      const { data: stageData, error: stageError } = await supabase
        .from('stages')
        .select('name')
        .eq('id', stageId)
        .single();

      if (stageError) throw stageError;

      // Buscar saídas da etapa
      let exitsQuery = supabase
        .from('opportunity_stage_history')
        .select('opportunity_id, moved_at')
        .eq('from_stage_id', stageId);

      if (dateFrom) {
        exitsQuery = exitsQuery.gte('moved_at', dateFrom.toISOString());
      }
      
      if (dateTo) {
        exitsQuery = exitsQuery.lte('moved_at', dateTo.toISOString());
      }

      const { data: exits, error: exitsError } = await exitsQuery;
      
      if (exitsError) throw exitsError;

      if (!exits || exits.length === 0) {
        return {
          stageId,
          stageName: stageData.name,
          averageDaysInStage: 0,
          totalOpportunities: 0
        };
      }

      // Para cada saída, buscar a entrada correspondente
      const durations = await Promise.all(
        exits.map(async (exit: any) => {
          const { data: entry, error: entryError } = await supabase
            .from('opportunity_stage_history')
            .select('moved_at')
            .eq('opportunity_id', exit.opportunity_id)
            .eq('to_stage_id', stageId)
            .order('moved_at', { ascending: false })
            .limit(1)
            .single();

          if (entryError || !entry) return null;

          const entryDate = new Date(entry.moved_at);
          const exitDate = new Date(exit.moved_at);
          const daysDiff = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysDiff > 0 ? daysDiff : null;
        })
      );

      const validDurations = durations.filter(d => d !== null && d > 0) as number[];
      
      const averageDaysInStage = validDurations.length > 0 
        ? validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length 
        : 0;

      return {
        stageId,
        stageName: stageData.name,
        averageDaysInStage,
        totalOpportunities: validDurations.length
      };
    } catch (error) {
      console.error("Error calculating stage velocity:", error);
      return null;
    }
  }
};
