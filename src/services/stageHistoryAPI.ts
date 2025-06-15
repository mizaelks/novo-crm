

import { supabase } from "@/integrations/supabase/client";
import { StageHistoryEntry, PassThroughRateData, StageVelocityData, FunnelPassThroughData } from "@/types/stageHistory";

export const stageHistoryAPI = {
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
  },

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
          const rate = await this.getStagePassThroughRate(stage.id, dateFrom, dateTo);
          return rate;
        })
      );

      // Add null check for stageRates
      const validStageRates = (stageRates || []).filter((rate): rate is PassThroughRateData => rate !== null);

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
      const averageVelocity = await this.getFunnelAverageVelocity(funnelId, dateFrom, dateTo);

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
  },

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

      const validVelocities = velocities.filter((v): v is number => v !== null && v > 0);
      
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

