
import { TrendingUp, DollarSign, Target, Zap } from "lucide-react";
import { formatCurrency } from "@/services/utils/dateUtils";
import { useDateFilter } from "@/hooks/useDateFilter";
import StatsCard from "@/components/dashboard/StatsCard";

interface InsightsStatsProps {
  loading: boolean;
  stats: {
    totalOpportunities: number;
    totalValue: number;
    totalSales: number;
    totalSalesValue: number;
  };
}

const InsightsStats = ({ loading, stats }: InsightsStatsProps) => {
  const { getFilterLabel } = useDateFilter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="Total de Oportunidades"
        value={loading ? 0 : stats.totalOpportunities}
        subtitle={getFilterLabel}
        icon={Target}
      />
      <StatsCard
        title="Valor Total"
        value={loading ? "R$ 0,00" : formatCurrency(stats.totalValue)}
        subtitle={getFilterLabel}
        icon={DollarSign}
        valueClassName="text-2xl font-bold text-primary"
      />
      <StatsCard
        title="Vendas Realizadas"
        value={loading ? 0 : stats.totalSales}
        subtitle={getFilterLabel}
        icon={TrendingUp}
        valueClassName="text-2xl font-bold text-green-600"
      />
      <StatsCard
        title="Valor de Vendas"
        value={loading ? "R$ 0,00" : formatCurrency(stats.totalSalesValue)}
        subtitle={getFilterLabel}
        icon={Zap}
        valueClassName="text-2xl font-bold text-green-600"
      />
    </div>
  );
};

export default InsightsStats;
