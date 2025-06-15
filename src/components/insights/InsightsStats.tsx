
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
  funnelType?: 'venda' | 'relacionamento' | 'all';
}

const InsightsStats = ({ loading, stats, funnelType = 'all' }: InsightsStatsProps) => {
  const { getFilterLabel } = useDateFilter();

  if (loading) {
    return <InsightsStatsSkeleton />;
  }

  // Determinar se deve mostrar valores monetários
  const showMonetaryValues = funnelType === 'venda' || funnelType === 'all';
  
  // Labels baseados no tipo de funil
  const salesLabel = funnelType === 'relacionamento' ? 'Oportunidades Convertidas' : 'Vendas Realizadas';
  const salesValueLabel = funnelType === 'relacionamento' ? 'Total Convertido' : 'Valor de Vendas';

  // Calcular subtitle para taxa de conversão
  const conversionSubtitle = `${stats.totalSales} de ${stats.totalOpportunities} oportunidades`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total de Oportunidades"
        value={stats.totalOpportunities}
        subtitle={getFilterLabel}
        icon={Target}
      />
      
      {showMonetaryValues && (
        <StatsCard
          title="Valor Total"
          value={formatCurrency(stats.totalValue)}
          subtitle={getFilterLabel}
          icon={DollarSign}
          valueClassName="text-2xl font-bold text-primary"
        />
      )}
      
      <StatsCard
        title={salesLabel}
        value={stats.totalSales}
        subtitle={getFilterLabel}
        icon={TrendingUp}
        valueClassName="text-2xl font-bold text-green-600"
      />
      
      {showMonetaryValues && (
        <StatsCard
          title={salesValueLabel}
          value={formatCurrency(stats.totalSalesValue)}
          subtitle={getFilterLabel}
          icon={Zap}
          valueClassName="text-2xl font-bold text-green-600"
        />
      )}
      
      {showMonetaryValues && (
        <StatsCard
          title="Ticket Médio"
          value={formatCurrency(stats.averageTicket)}
          subtitle={getFilterLabel}
          icon={Calculator}
          valueClassName="text-2xl font-bold text-blue-600"
        />
      )}
      
      <StatsCard
        title="Taxa de Conversão"
        value={`${stats.conversionRate.toFixed(1)}%`}
        subtitle={conversionSubtitle}
        icon={Percent}
        valueClassName="text-2xl font-bold text-purple-600"
      />
    </div>
  );
};

export default InsightsStats;
