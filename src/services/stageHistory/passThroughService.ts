
import { supabase } from "@/integrations/supabase/client";
import { PassThroughRateData, FunnelPassThroughData } from "@/types/stageHistory";

export const passThroughService = {
  // Calcular taxa de passagem para uma etapa específica
  getStagePassThroughRate: async (stageId: string, dateFrom?: Date, dateTo?: Date): Promise<PassThroughRateData | null> => {
    try {
      // Buscar nome da etapa
      const { data: stageData, error: stageError } = await supabase
        .from('stages')
        .select('name')
        .eq('id', stageId)
        .single();

      if (stageError) throw stageError;

      // Construir query base
      let entriesQuery = supabase
        .from('opportunity_stage_history')
        .select('*')
        .eq('to_stage_id', stageId);

      let exitsQuery = supabase
        .from('opportunity_stage_history')
        .select('*')
        .eq('from_stage_id', stageId);

      // Aplicar filtro de data se fornecido
      if (dateFrom) {
        entriesQuery = entriesQuery.gte('moved_at', dateFrom.toISOString());
        exitsQuery = exitsQuery.gte('moved_at', dateFrom.toISOString());
      }
      
      if (dateTo) {
        entriesQuery = entriesQuery.lte('moved_at', dateTo.toISOString());
        exitsQuery = exitsQuery.lte('moved_at', dateTo.toISOString());
      }

      // Executar queries
      const [entriesResult, exitsResult] = await Promise.all([
        entriesQuery,
        exitsQuery
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (exitsResult.error) throw exitsResult.error;

      const entriesCount = entriesResult.data?.length || 0;
      const exitsCount = exitsResult.data?.length || 0;

      // Calcular oportunidades atualmente na etapa
      const { data: currentOpps, error: currentError } = await supabase
        .from('opportunities')
        .select('id')
        .eq('stage_id', stageId);

      if (currentError) throw currentError;

      const currentCount = currentOpps?.length || 0;
      const passThroughRate = entriesCount > 0 ? (exitsCount / entriesCount) * 100 : 0;

      return {
        stageId,
        stageName: stageData.name,
        entriesCount,
        exitsCount,
        passThroughRate,
        currentCount
      };
    } catch (error) {
      console.error("Error calculating stage pass-through rate:", error);
      return null;
    }
  },

  // Calcular taxas de passagem para todas as etapas de um funil
  getFunnelPassThroughRates: async (funnelId: string, dateFrom?: Date, dateTo?: Date): Promise<FunnelPassThroughData | null> => {
    try {
      // Buscar funil e suas etapas
      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .select(`
          name,
          stages (
            id,
            name,
            order
          )
        `)
        .eq('id', funnelId)
        .single();

      if (funnelError) throw funnelError;

      // Check if stages exist and is an array
      if (!funnelData?.stages || !Array.isArray(funnelData.stages)) {
        return {
          funnelId,
          funnelName: funnelData?.name || '',
          stages: [],
          overallConversionRate: 0,
          averageVelocity: 0
        };
      }

      // Ordenar etapas
      const sortedStages = funnelData.stages.sort((a: any, b: any) => a.order - b.order);

      // Calcular taxa de passagem para cada etapa
      const stageRates = await Promise.all(
        sortedStages.map(async (stage: any) => {
          const rate = await passThroughService.getStagePassThroughRate(stage.id, dateFrom, dateTo);
          return rate;
        })
      );

      // Add null check for stageRates
      const validStageRates = stageRates?.filter((rate): rate is PassThroughRateData => rate !== null) || [];

      // Calcular taxa de conversão geral (primeira etapa para etapas de ganho)
      const firstStage = validStageRates[0];
      const { data: winStages, error: winError } = await supabase
        .from('stages')
        .select('id')
        .eq('funnel_id', funnelId)
        .eq('is_win_stage', true);

      if (winError) throw winError;

      let totalWins = 0;
      if (winStages && winStages.length > 0) {
        for (const winStage of winStages) {
          const { data: winsData, error: winsError } = await supabase
            .from('opportunities')
            .select('id')
            .eq('stage_id', winStage.id);
          
          if (!winsError && winsData) {
            totalWins += winsData.length;
          }
        }
      }

      const overallConversionRate = firstStage && firstStage.entriesCount > 0 
        ? (totalWins / firstStage.entriesCount) * 100 
        : 0;

      // Calcular velocidade média (simplificado)
      const averageVelocity = await velocityService.getFunnelAverageVelocity(funnelId, dateFrom, dateTo);

      return {
        funnelId,
        funnelName: funnelData.name,
        stages: validStageRates,
        overallConversionRate,
        averageVelocity
      };
    } catch (error) {
      console.error("Error calculating funnel pass-through rates:", error);
      return null;
    }
  }
};

// Import velocityService to avoid circular dependency
import { velocityService } from "./velocityService";
