
import { TrendingUp, DollarSign, Target, Zap, Calculator, Percent } from "lucide-react";
import { formatCurrency } from "@/services/utils/dateUtils";
import { useDateFilter } from "@/hooks/useDateFilter";
import StatsCard from "@/components/dashboard/StatsCard";
import TrendIndicator from "./TrendIndicator";
import InsightsStatsSkeleton from "./InsightsStatsSkeleton";

interface InsightsStatsProps {
  loading: boolean;
  stats: {
    totalOpportunities: number;
    totalValue: number;
    totalSales: number;
    totalSalesValue: number;
    averageTicket: number;
    conversionRate: number;
    previousPeriodStats?: {
      totalOpportunities: number;
      totalValue: number;
      totalSales: number;
      totalSalesValue: number;
      averageTicket: number;
      conversionRate: number;
    };
  };
}

const InsightsStats = ({ loading, stats }: InsightsStatsProps) => {
  const { getFilterLabel } = useDateFilter();

  if (loading) {
    return <InsightsStatsSkeleton />;
  }

  const { previousPeriodStats } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total de Oportunidades"
        value={stats.totalOpportunities}
        subtitle={
          <div className="flex items-center justify-between">
            <span>{getFilterLabel}</span>
            {previousPeriodStats && (
              <TrendIndicator 
                currentValue={stats.totalOpportunities}
                previousValue={previousPeriodStats.totalOpportunities}
              />
            )}
          </div>
        }
        icon={Target}
      />
      
      <StatsCard
        title="Valor Total"
        value={formatCurrency(stats.totalValue)}
        subtitle={
          <div className="flex items-center justify-between">
            <span>{getFilterLabel}</span>
            {previousPeriodStats && (
              <TrendIndicator 
                currentValue={stats.totalValue}
                previousValue={previousPeriodStats.totalValue}
                isCurrency
              />
            )}
          </div>
        }
        icon={DollarSign}
        valueClassName="text-2xl font-bold text-primary"
      />
      
      <StatsCard
        title="Vendas Realizadas"
        value={stats.totalSales}
        subtitle={
          <div className="flex items-center justify-between">
            <span>{getFilterLabel}</span>
            {previousPeriodStats && (
              <TrendIndicator 
                currentValue={stats.totalSales}
                previousValue={previousPeriodStats.totalSales}
              />
            )}
          </div>
        }
        icon={TrendingUp}
        valueClassName="text-2xl font-bold text-green-600"
      />
      
      <StatsCard
        title="Valor de Vendas"
        value={formatCurrency(stats.totalSalesValue)}
        subtitle={
          <div className="flex items-center justify-between">
            <span>{getFilterLabel}</span>
            {previousPeriodStats && (
              <TrendIndicator 
                currentValue={stats.totalSalesValue}
                previousValue={previousPeriodStats.totalSalesValue}
                isCurrency
              />
            )}
          </div>
        }
        icon={Zap}
        valueClassName="text-2xl font-bold text-green-600"
      />
      
      <StatsCard
        title="Ticket Médio"
        value={formatCurrency(stats.averageTicket)}
        subtitle={
          <div className="flex items-center justify-between">
            <span>{getFilterLabel}</span>
            {previousPeriodStats && (
              <TrendIndicator 
                currentValue={stats.averageTicket}
                previousValue={previousPeriodStats.averageTicket}
                isCurrency
              />
            )}
          </div>
        }
        icon={Calculator}
        valueClassName="text-2xl font-bold text-blue-600"
      />
      
      <StatsCard
        title="Taxa de Conversão"
        value={`${stats.conversionRate.toFixed(1)}%`}
        subtitle={
          <div className="flex items-center justify-between">
            <span>{getFilterLabel}</span>
            {previousPeriodStats && (
              <TrendIndicator 
                currentValue={stats.conversionRate}
                previousValue={previousPeriodStats.conversionRate}
                isPercentage
              />
            )}
          </div>
        }
        icon={Percent}
        valueClassName="text-2xl font-bold text-purple-600"
      />
    </div>
  );
};

export default InsightsStats;
