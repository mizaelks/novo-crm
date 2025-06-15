
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
  const memoizedStageDistribution = useMemo(() => 
    processStageDistribution(filteredFunnels), 
    [processStageDistribution, filteredFunnels, filter, selectedUser, selectedWinReason, selectedLossReason]
  );

  const memoizedValueOverTime = useMemo(() => 
    processValueOverTime(filteredFunnels), 
    [processValueOverTime, filteredFunnels, selectedUser, selectedWinReason, selectedLossReason]
  );

  return {
    memoizedStageDistribution,
    memoizedValueOverTime
  };
};
