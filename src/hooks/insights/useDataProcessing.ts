
import { useCallback, useMemo } from "react";
import { Funnel } from "@/types";
import { ConversionData, ValueData } from "./types";

export const useDataProcessing = (
  filteredFunnels: Funnel[],
  filterOpportunities: (opportunities: any[], stageId?: string) => any[],
  selectedUser: string,
  selectedWinReason: string,
  selectedLossReason: string,
  filter: any
) => {
  // Memoize data processing functions
  const processConversionData = useCallback((funnelsData: Funnel[]) => {
    const conversionArray: ConversionData[] = [];
    
    funnelsData.forEach(funnel => {
      // Para cada funil, vamos calcular a taxa de conversão entre etapas consecutivas
      for (let i = 0; i < funnel.stages.length - 1; i++) {
        const currentStage = funnel.stages[i];
        const nextStage = funnel.stages[i + 1];
        
        const currentStageOpps = filterOpportunities(currentStage.opportunities, currentStage.id);
        const nextStageOpps = filterOpportunities(nextStage.opportunities, nextStage.id);
        
        // Calcular quantas oportunidades da etapa atual avançaram para a próxima
        const convertedOpps = currentStageOpps.filter(currentOpp => 
          nextStageOpps.some(nextOpp => nextOpp.id === currentOpp.id)
        );
        
        const conversionRate = currentStageOpps.length > 0 
          ? Math.round((convertedOpps.length / currentStageOpps.length) * 100) 
          : 0;
        
        // Encontrar se já existe uma entrada para esta etapa
        const existingIndex = conversionArray.findIndex(item => item.stageName === currentStage.name);
        
        if (existingIndex >= 0) {
          // Atualizar entrada existente (somar oportunidades e recalcular taxa)
          const existing = conversionArray[existingIndex];
          const totalOpps = existing.opportunities + currentStageOpps.length;
          const totalConverted = Math.round((existing.conversionRate * existing.opportunities / 100)) + convertedOpps.length;
          
          conversionArray[existingIndex] = {
            stageName: currentStage.name,
            opportunities: totalOpps,
            conversionRate: totalOpps > 0 ? Math.round((totalConverted / totalOpps) * 100) : 0
          };
        } else {
          // Criar nova entrada
          conversionArray.push({
            stageName: currentStage.name,
            opportunities: currentStageOpps.length,
            conversionRate: conversionRate
          });
        }
      }
      
      // Para a última etapa, não há conversão (é o final do funil)
      const lastStage = funnel.stages[funnel.stages.length - 1];
      const lastStageOpps = filterOpportunities(lastStage.opportunities, lastStage.id);
      
      const existingLastIndex = conversionArray.findIndex(item => item.stageName === lastStage.name);
      
      if (existingLastIndex >= 0) {
        conversionArray[existingLastIndex].opportunities += lastStageOpps.length;
      } else {
        conversionArray.push({
          stageName: lastStage.name,
          opportunities: lastStageOpps.length,
          conversionRate: 0 // Última etapa não tem conversão
        });
      }
    });

    return conversionArray.filter(item => item.opportunities > 0);
  }, [filterOpportunities]);

  const processStageDistribution = useCallback((funnelsData: Funnel[]) => {
    const stageData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterOpportunities(stage.opportunities, stage.id);
        if (!stageData[stage.name]) {
          stageData[stage.name] = 0;
        }
        stageData[stage.name] += filteredOpportunities.length;
      });
    });

    return Object.entries(stageData)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [filterOpportunities]);

  const processValueOverTime = useCallback((funnelsData: Funnel[]) => {
    const monthData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterOpportunities(stage.opportunities, stage.id);
        filteredOpportunities.forEach(opp => {
          const date = new Date(opp.createdAt);
          const month = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          if (!monthData[month]) {
            monthData[month] = 0;
          }
          monthData[month] += opp.value;
        });
      });
    });

    // Ordenar por data e pegar os últimos 6 meses
    const sortedData = Object.entries(monthData)
      .map(([month, value]) => ({ month, value, date: new Date(month) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6)
      .map(({ month, value }) => ({ month, value }));

    return sortedData;
  }, [filterOpportunities]);

  // Memoize processed data to prevent unnecessary recalculations
  const memoizedConversionData = useMemo(() => 
    processConversionData(filteredFunnels), 
    [processConversionData, filteredFunnels, filter, selectedUser, selectedWinReason, selectedLossReason]
  );

  const memoizedStageDistribution = useMemo(() => 
    processStageDistribution(filteredFunnels), 
    [processStageDistribution, filteredFunnels, filter, selectedUser, selectedWinReason, selectedLossReason]
  );

  const memoizedValueOverTime = useMemo(() => 
    processValueOverTime(filteredFunnels), 
    [processValueOverTime, filteredFunnels, selectedUser, selectedWinReason, selectedLossReason]
  );

  return {
    memoizedConversionData,
    memoizedStageDistribution,
    memoizedValueOverTime
  };
};
