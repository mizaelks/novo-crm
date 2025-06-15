
import { TrendingUp, DollarSign, Target, Zap, Calculator, Percent, Heart } from "lucide-react";
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
    totalRelationships: number;
    averageTicket: number;
    conversionRate: number;
    relationshipConversionRate: number;
    previousPeriodStats?: {
      totalOpportunities: number;
      totalValue: number;
      totalSales: number;
      totalSalesValue: number;
      totalRelationships: number;
      averageTicket: number;
      conversionRate: number;
      relationshipConversionRate: number;
    };
  };
  funnelType?: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

const InsightsStats = ({ loading, stats, funnelType = 'all' }: InsightsStatsProps) => {
  const { getFilterLabel } = useDateFilter();

  console.log('InsightsStats - funnelType recebido:', funnelType);

  if (loading) {
    return <InsightsStatsSkeleton />;
  }

  // Determinar se deve mostrar valores monetários e vendas
  const showMonetaryValues = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';
  const showSalesMetrics = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';
  const showRelationshipMetrics = funnelType === 'relacionamento' || funnelType === 'all' || funnelType === 'mixed';
  
  console.log('InsightsStats - showMonetaryValues:', showMonetaryValues, 'showSalesMetrics:', showSalesMetrics, 'showRelationshipMetrics:', showRelationshipMetrics);
  
  // Calcular subtitle para taxa de conversão com base no tipo de funil
  const getConversionSubtitle = () => {
    if (funnelType === 'relacionamento') {
      return `${stats.totalRelationships} relacionamentos de ${stats.totalOpportunities} oportunidades`;
    }
    
    if (!showSalesMetrics) {
      return 'Apenas funis de venda geram vendas';
    }
    
    if (funnelType === 'mixed') {
      return `${stats.totalSales} vendas de oportunidades em funis de venda`;
    }
    
    return `${stats.totalSales} vendas de ${stats.totalOpportunities} oportunidades`;
  };

  const getRelationshipConversionSubtitle = () => {
    if (funnelType === 'venda') {
      return 'Funis de venda não têm relacionamentos';
    }
    
    if (funnelType === 'mixed') {
      return `${stats.totalRelationships} relacionamentos de oportunidades em funis de relacionamento`;
    }
    
    return `${stats.totalRelationships} relacionamentos de ${stats.totalOpportunities} oportunidades`;
  };

  const conversionSubtitle = getConversionSubtitle();
  const relationshipConversionSubtitle = getRelationshipConversionSubtitle();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total de Oportunidades"
        value={stats.totalOpportunities}
        subtitle={getFilterLabel}
        icon={Target}
        tooltip="Inclui todas as oportunidades independente do tipo de funil"
      />
      
      {showMonetaryValues && (
        <StatsCard
          title="Valor Total de Oportunidades"
          value={formatCurrency(stats.totalValue)}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={DollarSign}
          valueClassName="text-2xl font-bold text-primary"
          tooltip="Valores monetários apenas de oportunidades em funis de venda"
        />
      )}
      
      {showSalesMetrics && (
        <StatsCard
          title="Vendas Realizadas"
          value={stats.totalSales}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={TrendingUp}
          valueClassName="text-2xl font-bold text-green-600"
          tooltip="Vendas concluídas em estágios de vitória de funis de venda"
        />
      )}

      {showRelationshipMetrics && (
        <StatsCard
          title="Relacionamentos Conquistados"
          value={stats.totalRelationships}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de relacionamento)` : getFilterLabel}
          icon={Heart}
          valueClassName="text-2xl font-bold text-blue-600"
          tooltip="Relacionamentos conquistados em estágios de vitória de funis de relacionamento"
        />
      )}
      
      {showSalesMetrics && showMonetaryValues && (
        <StatsCard
          title="Valor das Vendas Realizadas"
          value={formatCurrency(stats.totalSalesValue)}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={Zap}
          valueClassName="text-2xl font-bold text-green-600"
          tooltip="Valor total das vendas concluídas apenas de funis de venda"
        />
      )}
      
      {showSalesMetrics && showMonetaryValues && (
        <StatsCard
          title="Ticket Médio"
          value={formatCurrency(stats.averageTicket)}
          subtitle={funnelType === 'mixed' ? `${getFilterLabel} (apenas funis de venda)` : getFilterLabel}
          icon={Calculator}
          valueClassName="text-2xl font-bold text-blue-600"
          tooltip="Valor médio por venda realizada em funis de venda"
        />
      )}
      
      {showSalesMetrics && (
        <StatsCard
          title="Taxa de Conversão (Vendas)"
          value={`${stats.conversionRate.toFixed(1)}%`}
          subtitle={conversionSubtitle}
          icon={Percent}
          valueClassName="text-2xl font-bold text-purple-600"
          tooltip="Percentual de oportunidades convertidas em vendas (apenas funis de venda)"
        />
      )}

      {showRelationshipMetrics && funnelType !== 'venda' && (
        <StatsCard
          title="Taxa de Conversão (Relacionamentos)"
          value={`${stats.relationshipConversionRate.toFixed(1)}%`}
          subtitle={relationshipConversionSubtitle}
          icon={Percent}
          valueClassName="text-2xl font-bold text-blue-600"
          tooltip="Percentual de oportunidades convertidas em relacionamentos (apenas funis de relacionamento)"
        />
      )}
    </div>
  );
};

export default InsightsStats;
