
import { useCallback } from "react";
import { Funnel } from "@/types";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";
import { subDays, subWeeks, subMonths } from "date-fns";

export interface StatsData {
  totalOpportunities: number;
  totalValue: number;
  totalSales: number;
  totalSalesValue: number;
  totalRelationships: number;
  averageTicket: number;
  conversionRate: number;
  relationshipConversionRate: number;
}

export interface EnhancedStatsData extends StatsData {
  previousPeriodStats?: StatsData;
}

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
    let totalRelationships = 0;
    let vendaOpportunities = 0; // Contador específico para oportunidades de venda
    let relacionamentoOpportunities = 0; // Contador específico para oportunidades de relacionamento

    console.log('🧮 calculateStatsForPeriod - Iniciando cálculo para:', funnelsData.map(f => ({ name: f.name, type: f.funnelType })));

    funnelsData.forEach(funnel => {
      console.log(`📊 Processando funil "${funnel.name}" (${funnel.funnelType})`);
      
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
        
        // For 'venda' funnels only
        if (funnel.funnelType === 'venda') {
          // Count opportunities from venda funnels for conversion rate
          vendaOpportunities += opportunities.length;
          
          opportunities.forEach(opp => {
            // Sum values for venda funnels
            totalValue += opp.value;
            
            // Count sales only for win stages in venda funnels
            if (stage.isWinStage) {
              totalSales++;
              totalSalesValue += opp.value;
              console.log(`💰 Venda registrada: R$ ${opp.value} no estágio "${stage.name}"`);
            }
          });
        } 
        // For 'relacionamento' funnels
        else if (funnel.funnelType === 'relacionamento') {
          // Count opportunities from relacionamento funnels for conversion rate
          relacionamentoOpportunities += opportunities.length;
          
          // Count relationships only for win stages in relacionamento funnels
          if (stage.isWinStage) {
            totalRelationships += opportunities.length;
            console.log(`🤝 ${opportunities.length} relacionamento(s) conquistado(s) no estágio "${stage.name}"`);
          }
        }
      });
    });

    const averageTicket = totalSales > 0 ? totalSalesValue / totalSales : 0;
    // Conversion rate: vendas / oportunidades de venda (apenas funis de venda)
    const conversionRate = vendaOpportunities > 0 ? (totalSales / vendaOpportunities) * 100 : 0;
    // Relationship conversion rate: relacionamentos / oportunidades de relacionamento (apenas funis de relacionamento)
    const relationshipConversionRate = relacionamentoOpportunities > 0 ? (totalRelationships / relacionamentoOpportunities) * 100 : 0;

    console.log('✅ Stats calculation resultado final:', {
      totalOpportunities,
      vendaOpportunities,
      relacionamentoOpportunities,
      totalValue,
      totalSales,
      totalSalesValue,
      totalRelationships,
      conversionRate,
      relationshipConversionRate,
      averageTicket
    });

    return {
      totalOpportunities,
      totalValue,
      totalSales,
      totalSalesValue,
      totalRelationships,
      averageTicket,
      conversionRate,
      relationshipConversionRate
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
