
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

export const useInsightsData = (selectedFunnel: string) => {
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
  }, [filter]);

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
          opportunities = filterByDate(opportunities, 'createdAt');
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
  }, [filterByDate]);

  const processConversionData = useCallback((funnelsData: Funnel[]) => {
    const stageData: { [key: string]: { total: number, converted: number } } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach((stage, index) => {
        if (!stageData[stage.name]) {
          stageData[stage.name] = { total: 0, converted: 0 };
        }
        
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        stageData[stage.name].total += filteredOpportunities.length;
        
        // Calculate conversions (opportunities that moved to next stage)
        if (index < funnel.stages.length - 1) {
          const nextStage = funnel.stages[index + 1];
          const nextStageOpps = filterByDate(nextStage.opportunities, 'createdAt');
          stageData[stage.name].converted += nextStageOpps.length;
        }
      });
    });

    const conversionArray = Object.entries(stageData).map(([stageName, data]) => ({
      stageName,
      opportunities: data.total,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0
    }));

    setConversionData(conversionArray);
  }, [filterByDate]);

  const processStageDistribution = useCallback((funnelsData: Funnel[]) => {
    const stageData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        if (!stageData[stage.name]) {
          stageData[stage.name] = 0;
        }
        stageData[stage.name] += filteredOpportunities.length;
      });
    });

    const distributionArray = Object.entries(stageData).map(([name, value]) => ({
      name,
      value
    }));

    setStageDistribution(distributionArray);
  }, [filterByDate]);

  const processValueOverTime = useCallback((funnelsData: Funnel[]) => {
    const monthData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        stage.opportunities.forEach(opp => {
          const month = new Date(opp.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          if (!monthData[month]) {
            monthData[month] = 0;
          }
          monthData[month] += opp.value;
        });
      });
    });

    const valueArray = Object.entries(monthData)
      .map(([month, value]) => ({ month, value }))
      .slice(-6); // Last 6 months

    setValueOverTime(valueArray);
  }, []);

  const getTotalStats = useCallback((): EnhancedStatsData => {
    const currentStats = calculateStatsForPeriod(filteredFunnels);
    
    // Calculate previous period stats for comparison
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const funnelsData = await funnelAPI.getAll();
        setFunnels(funnelsData);
        
        // Process data for charts with the filtered funnels
        const filtered = selectedFunnel === "all" 
          ? funnelsData 
          : funnelsData.filter(f => f.id === selectedFunnel);
        
        processConversionData(filtered);
        processStageDistribution(filtered);
        processValueOverTime(filtered);
      } catch (error) {
        console.error("Error loading insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedFunnel, filter, processConversionData, processStageDistribution, processValueOverTime]);

  return {
    funnels,
    loading,
    conversionData,
    stageDistribution,
    valueOverTime,
    getTotalStats
  };
};
