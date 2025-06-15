
import { useCallback } from "react";
import { Funnel } from "@/types";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";
import { subDays, subWeeks, subMonths } from "date-fns";
import { StatsData, EnhancedStatsData } from "./types";

export const useStatsCalculation = (
  filteredFunnels: Funnel[],
  filterOpportunities: (opportunities: any[], stageId?: string) => any[]
) => {
  const { filter } = useDateFilter();

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
        
        // Count all opportunities regardless of funnel type
        totalOpportunities += opportunities.length;
        
        opportunities.forEach(opp => {
          // Only count values and sales for 'venda' funnels
          if (funnel.funnelType === 'venda') {
            totalValue += opp.value;
            
            // Only 'venda' funnels can generate sales
            if (stage.isWinStage) {
              totalSales++;
              totalSalesValue += opp.value;
            }
          }
          // For 'relacionamento' funnels, we don't count monetary values or sales
        });
      });
    });

    const averageTicket = totalSales > 0 ? totalSalesValue / totalSales : 0;
    // Conversion rate only makes sense for 'venda' funnels
    // Calculate based on opportunities from 'venda' funnels only
    const vendaOpportunities = funnelsData
      .filter(f => f.funnelType === 'venda')
      .reduce((acc, funnel) => {
        return acc + funnel.stages.reduce((stageAcc, stage) => {
          let opportunities = stage.opportunities;
          if (fromDate && toDate) {
            opportunities = opportunities.filter(opp => {
              const oppDate = new Date(opp.createdAt);
              return oppDate >= fromDate && oppDate <= toDate;
            });
          } else {
            opportunities = filterOpportunities(opportunities, stage.id);
          }
          return stageAcc + opportunities.length;
        }, 0);
      }, 0);
    
    const conversionRate = vendaOpportunities > 0 ? (totalSales / vendaOpportunities) * 100 : 0;

    console.log('Stats calculation:', {
      totalOpportunities,
      totalValue,
      totalSales,
      totalSalesValue,
      vendaOpportunities,
      conversionRate
    });

    return {
      totalOpportunities,
      totalValue,
      totalSales,
      totalSalesValue,
      averageTicket,
      conversionRate
    };
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

  return { getTotalStats };
};
