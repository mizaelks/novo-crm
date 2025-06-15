
import { useState, useEffect, useMemo, useCallback } from "react";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";
import { subDays, subWeeks, subMonths } from "date-fns";

interface ConversionData {
  stageName: string;
  opportunities: number;
  conversionRate: number;
}

interface ValueData {
  month: string;
  value: number;
}

interface StatsData {
  totalOpportunities: number;
  totalValue: number;
  totalSales: number;
  totalSalesValue: number;
  averageTicket: number;
  conversionRate: number;
}

interface EnhancedStatsData extends StatsData {
  previousPeriodStats?: StatsData;
}

export const useInsightsData = (
  selectedFunnel: string, 
  selectedUser: string = "all",
  selectedWinReason: string = "all",
  selectedLossReason: string = "all"
) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [stageDistribution, setStageDistribution] = useState<any[]>([]);
  const [valueOverTime, setValueOverTime] = useState<ValueData[]>([]);
  
  const { filter, filterByDate } = useDateFilter();

  // Memoize filtered funnels to avoid recalculation
  const filteredFunnels = useMemo(() => {
    return selectedFunnel === "all" 
      ? funnels 
      : funnels.filter(f => f.id === selectedFunnel);
  }, [funnels, selectedFunnel]);

  // Function to filter opportunities by additional criteria
  const filterOpportunities = useCallback((opportunities: any[], stageId?: string) => {
    let filtered = opportunities;

    // Filter by date
    filtered = filterByDate(filtered, 'createdAt');

    // Filter by user
    if (selectedUser !== "all") {
      filtered = filtered.filter(opp => opp.userId === selectedUser);
    }

    // Filter by win reason - only for opportunities in win stages
    if (selectedWinReason !== "all") {
      filtered = filtered.filter(opp => {
        // Find the stage this opportunity belongs to
        const stage = filteredFunnels
          .flatMap(f => f.stages)
          .find(s => s.id === (stageId || opp.stageId));
        
        // Only filter by win reason if the opportunity is in a win stage
        if (stage?.isWinStage) {
          return opp.winReason === selectedWinReason;
        }
        
        // If not in a win stage, don't filter by win reason
        return true;
      });
    }

    // Filter by loss reason - only for opportunities in loss stages
    if (selectedLossReason !== "all") {
      filtered = filtered.filter(opp => {
        // Find the stage this opportunity belongs to
        const stage = filteredFunnels
          .flatMap(f => f.stages)
          .find(s => s.id === (stageId || opp.stageId));
        
        // Only filter by loss reason if the opportunity is in a loss stage
        if (stage?.isLossStage) {
          return opp.lossReason === selectedLossReason;
        }
        
        // If not in a loss stage, don't filter by loss reason
        return true;
      });
    }

    return filtered;
  }, [filterByDate, selectedUser, selectedWinReason, selectedLossReason, filteredFunnels]);

  // Function to get previous period dates
  const getPreviousPeriodDates = useCallback(() => {
    const today = new Date();
    
    switch (filter.type) {
      case DateFilterType.TODAY:
        return {
          from: subDays(today, 1),
          to: subDays(today, 1)
        };
      case DateFilterType.THIS_WEEK:
        return {
          from: subWeeks(today, 1),
          to: subDays(subWeeks(today, 1), -6)
        };
      case DateFilterType.THIS_MONTH:
        return {
          from: subMonths(today, 1),
          to: subDays(subMonths(today, 1), -29)
        };
      case DateFilterType.CUSTOM:
        if (filter.dateRange?.from && filter.dateRange?.to) {
          const daysDiff = Math.ceil((filter.dateRange.to.getTime() - filter.dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
          return {
            from: subDays(filter.dateRange.from, daysDiff),
            to: subDays(filter.dateRange.to, daysDiff)
          };
        }
        return null;
      default:
        return null;
    }
  }, [filter.type, filter.dateRange]);

  // Function to calculate stats for a given period
  const calculateStatsForPeriod = useCallback((funnelsData: Funnel[], fromDate?: Date, toDate?: Date): StatsData => {
    let totalOpportunities = 0;
    let totalValue = 0;
    let totalSales = 0;
    let totalSalesValue = 0;

    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        let opportunities = stage.opportunities;
        
        // Filter by date range if provided
        if (fromDate && toDate) {
          opportunities = opportunities.filter(opp => {
            const oppDate = new Date(opp.createdAt);
            return oppDate >= fromDate && oppDate <= toDate;
          });
        } else {
          opportunities = filterOpportunities(opportunities, stage.id);
        }
        
        totalOpportunities += opportunities.length;
        
        opportunities.forEach(opp => {
          totalValue += opp.value;
          if (stage.isWinStage) {
            totalSales++;
            totalSalesValue += opp.value;
          }
        });
      });
    });

    const averageTicket = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
    const conversionRate = totalOpportunities > 0 ? (totalSales / totalOpportunities) * 100 : 0;

    return {
      totalOpportunities,
      totalValue,
      totalSales,
      totalSalesValue,
      averageTicket,
      conversionRate
    };
  }, [filterOpportunities]);

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

  // Memoize stats calculation
  const getTotalStats = useCallback((): EnhancedStatsData => {
    const currentStats = calculateStatsForPeriod(filteredFunnels);
    
    const previousPeriod = getPreviousPeriodDates();
    let previousPeriodStats: StatsData | undefined;
    
    if (previousPeriod) {
      previousPeriodStats = calculateStatsForPeriod(
        filteredFunnels, 
        previousPeriod.from, 
        previousPeriod.to
      );
    }

    return {
      ...currentStats,
      previousPeriodStats
    };
  }, [filteredFunnels, calculateStatsForPeriod, getPreviousPeriodDates]);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const funnelsData = await funnelAPI.getAll();
        setFunnels(funnelsData);
      } catch (error) {
        console.error("Error loading insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update processed data when dependencies change
  useEffect(() => {
    if (!loading) {
      setConversionData(memoizedConversionData);
      setStageDistribution(memoizedStageDistribution);
      setValueOverTime(memoizedValueOverTime);
    }
  }, [loading, memoizedConversionData, memoizedStageDistribution, memoizedValueOverTime]);

  return {
    funnels,
    loading,
    conversionData,
    stageDistribution,
    valueOverTime,
    getTotalStats
  };
};
