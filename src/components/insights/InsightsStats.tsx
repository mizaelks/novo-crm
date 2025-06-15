
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
  funnelType?: 'venda' | 'relacionamento' | 'all' | 'mixed'; // CORRIGIDO - incluído 'relacionamento'
}

const InsightsStats = ({ loading, stats, funnelType = 'all' }: InsightsStatsProps) => {
  const { getFilterLabel } = useDateFilter();

  console.log('InsightsStats - funnelType recebido:', funnelType);

  if (loading) {
    return <InsightsStatsSkeleton />;
  }

  // Determinar se deve mostrar valores monetários e vendas - CORRIGIDO
  const showMonetaryValues = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';
  const showSalesMetrics = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';
  
  console.log('InsightsStats - showMonetaryValues:', showMonetaryValues, 'showSalesMetrics:', showSalesMetrics);
  
  // Labels baseados no tipo de funil
  const salesLabel = 'Vendas Realizadas'; // Sempre vendas, pois só aparecem para funis de venda
  const salesValueLabel = 'Valor de Vendas';

  // Calcular subtitle para taxa de conversão com base no tipo de funil
  const getConversionSubtitle = () => {
    if (funnelType === 'relacionamento') {
      return 'Funis de relacionamento não têm vendas';
    }
    
    if (!showSalesMetrics) {
      return 'Apenas funis de venda geram vendas';
    }
    
    if (funnelType === 'mixed') {
      return `${stats.totalSales} vendas de oportunidades em funis de venda`;
    }
    
    return `${stats.totalSales} vendas de ${stats.totalOpportunidades} oportunidades`;
  };

  const conversionSubtitle = getConversionSubtitle();

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
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={DollarSign}
          valueClassName="text-2xl font-bold text-primary"
        />
      )}
      
      {showSalesMetrics && (
        <StatsCard
          title={salesLabel}
          value={stats.totalSales}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={TrendingUp}
          valueClassName="text-2xl font-bold text-green-600"
        />
      )}
      
      {showSalesMetrics && showMonetaryValues && (
        <StatsCard
          title={salesValueLabel}
          value={formatCurrency(stats.totalSalesValue)}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={Zap}
          valueClassName="text-2xl font-bold text-green-600"
        />
      )}
      
      {showSalesMetrics && showMonetaryValues && (
        <StatsCard
          title="Ticket Médio"
          value={formatCurrency(stats.averageTicket)}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={Calculator}
          valueClassName="text-2xl font-bold text-blue-600"
        />
      )}
      
      {showSalesMetrics && (
        <StatsCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate.toFixed(1)}%`}
          subtitle={conversionSubtitle}
          icon={Percent}
          valueClassName="text-2xl font-bold text-purple-600"
        />
      )}
    </div>
  );
};

export default InsightsStats;
