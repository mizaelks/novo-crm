
import { useCallback, useMemo } from "react";
import { Funnel } from "@/types";
import { ValueData } from "./types";

export const useDataProcessing = (
  filteredFunnels: Funnel[],
  filterOpportunities: (opportunities: any[], stageId?: string) => any[],
  selectedUser: string,
  selectedWinReason: string,
  selectedLossReason: string,
  filter: any
) => {
  // Determinar o tipo de funil selecionado
  const getFunnelType = useCallback(() => {
    if (filteredFunnels.length === 0) return 'all';
    if (filteredFunnels.length === 1) return filteredFunnels[0].funnelType;
    
    // Se há múltiplos funis (caso "all"), verificar se são todos do mesmo tipo
    const types = [...new Set(filteredFunnels.map(f => f.funnelType))];
    return types.length === 1 ? types[0] : 'mixed';
  }, [filteredFunnels]);

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
    const funnelType = getFunnelType();
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterOpportunities(stage.opportunities, stage.id);
        filteredOpportunities.forEach(opp => {
          const date = new Date(opp.createdAt);
          const month = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          if (!monthData[month]) {
            monthData[month] = 0;
          }
          
          // Para funis de venda ou mixed, usar valor. Para relacionamento, usar contagem
          if (funnelType === 'venda' || funnelType === 'mixed' || funnelType === 'all') {
            // Se é funil de venda, usar valor; se é relacionamento ou mixed, usar contagem
            if (funnel.funnelType === 'venda') {
              monthData[month] += opp.value;
            } else {
              monthData[month] += 1; // contagem para funis de relacionamento
            }
          } else {
            // Apenas funis de relacionamento - usar contagem
            monthData[month] += 1;
          }
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
  }, [filterOpportunities, getFunnelType]);

  // Memoize processed data to prevent unnecessary recalculations
  const memoizedStageDistribution = useMemo(() => 
    processStageDistribution(filteredFunnels), 
    [processStageDistribution, filteredFunnels, filter, selectedUser, selectedWinReason, selectedLossReason]
  );

  const memoizedValueOverTime = useMemo(() => 
    processValueOverTime(filteredFunnels), 
    [processValueOverTime, filteredFunnels, selectedUser, selectedWinReason, selectedLossReason]
  );

  const funnelType = getFunnelType();

  return {
    memoizedStageDistribution,
    memoizedValueOverTime,
    funnelType
  };
};
