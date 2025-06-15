
import { TrendingUp, DollarSign, Target, Zap, Calculator, Percent } from "lucide-react";
import { formatCurrency } from "@/services/utils/dateUtils";
import { useDateFilter } from "@/hooks/useDateFilter";
import StatsCard from "@/components/dashboard/StatsCard";
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

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatTrend = (current: number, previous: number, isCurrency = false, isPercentage = false) => {
    const change = calculatePercentageChange(current, previous);
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    if (isNeutral) return "Sem alteração";
    
    const sign = isPositive ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total de Oportunidades"
        value={stats.totalOpportunities}
        subtitle={getFilterLabel}
        icon={Target}
      />
      
      <StatsCard
        title="Valor Total"
        value={formatCurrency(stats.totalValue)}
        subtitle={getFilterLabel}
        icon={DollarSign}
        valueClassName="text-2xl font-bold text-primary"
      />
      
      <StatsCard
        title="Vendas Realizadas"
        value={stats.totalSales}
        subtitle={getFilterLabel}
        icon={TrendingUp}
        valueClassName="text-2xl font-bold text-green-600"
      />
      
      <StatsCard
        title="Valor de Vendas"
        value={formatCurrency(stats.totalSalesValue)}
        subtitle={getFilterLabel}
        icon={Zap}
        valueClassName="text-2xl font-bold text-green-600"
      />
      
      <StatsCard
        title="Ticket Médio"
        value={formatCurrency(stats.averageTicket)}
        subtitle={getFilterLabel}
        icon={Calculator}
        valueClassName="text-2xl font-bold text-blue-600"
      />
      
      <StatsCard
        title="Taxa de Conversão"
        value={`${stats.conversionRate.toFixed(1)}%`}
        subtitle={getFilterLabel}
        icon={Percent}
        valueClassName="text-2xl font-bold text-purple-600"
      />
    </div>
  );
};

export default InsightsStats;
