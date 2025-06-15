
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
    const stageData: { [key: string]: { total: number, converted: number } } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach((stage, index) => {
        if (!stageData[stage.name]) {
          stageData[stage.name] = { total: 0, converted: 0 };
        }
        
        const filteredOpportunities = filterOpportunities(stage.opportunities, stage.id);
        stageData[stage.name].total += filteredOpportunities.length;
        
        if (index < funnel.stages.length - 1) {
          const nextStage = funnel.stages[index + 1];
          const nextStageOpps = filterOpportunities(nextStage.opportunities, nextStage.id);
          stageData[stage.name].converted += nextStageOpps.length;
        }
      });
    });

    const conversionArray = Object.entries(stageData).map(([stageName, data]) => ({
      stageName,
      opportunities: data.total,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0
    }));

    return conversionArray;
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

    return Object.entries(stageData).map(([name, value]) => ({
      name,
      value
    }));
  }, [filterOpportunities]);

  const processValueOverTime = useCallback((funnelsData: Funnel[]) => {
    const monthData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterOpportunities(stage.opportunities, stage.id);
        filteredOpportunities.forEach(opp => {
          const month = new Date(opp.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          if (!monthData[month]) {
            monthData[month] = 0;
          }
          monthData[month] += opp.value;
        });
      });
    });

    return Object.entries(monthData)
      .map(([month, value]) => ({ month, value }))
      .slice(-6);
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
