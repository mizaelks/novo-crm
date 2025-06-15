
import { useState, useEffect } from "react";
import { Funnel } from "@/types";
import { funnelAPI } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FunnelList from "@/components/funnel/FunnelList";
import { useDateFilter, DateFilterType, DateRange } from "@/hooks/useDateFilter";
import { formatCurrency } from "@/services/utils/dateUtils";
import { CalendarDays, TrendingUp, DollarSign, Target, Building2, Users, Heart } from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import PendingTasksCard from "@/components/dashboard/PendingTasksCard";
import SalesValueCard from "@/components/dashboard/SalesValueCard";
import DashboardCustomizer from "@/components/dashboard/DashboardCustomizer";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [totalOpportunityValue, setTotalOpportunityValue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [salesValue, setSalesValue] = useState(0);
  const [totalRelationships, setTotalRelationships] = useState(0);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  
  const { filter, setFilterType, setDateRange, filterByDate, getFilterLabel } = useDateFilter();
  const { enabledWidgets } = useDashboardLayout();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const funnelsData = await funnelAPI.getAll();
        
        setFunnels(funnelsData);
        
        // Calculate statistics based on filter
        let oppCount = 0;
        let totalOppValue = 0;
        let salesCount = 0;
        let totalSalesValue = 0;
        let relationshipsCount = 0;
        
        funnelsData.forEach(funnel => {
          funnel.stages.forEach(stage => {
            // Filter opportunities by date
            const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
            
            // Count all opportunities
            oppCount += filteredOpportunities.length;
            
            // Process based on funnel type
            if (funnel.funnelType === 'venda') {
              // Sum values only for 'venda' funnels
              filteredOpportunities.forEach(opp => {
                totalOppValue += opp.value;
              });
              
              // Count and sum values for win stages ONLY in 'venda' funnels
              if (stage.isWinStage) {
                salesCount += filteredOpportunities.length;
                filteredOpportunities.forEach(opp => {
                  totalSalesValue += opp.value;
                });
              }
            } else if (funnel.funnelType === 'relacionamento') {
              // Count relationships won in 'relacionamento' funnels
              if (stage.isWinStage) {
                relationshipsCount += filteredOpportunities.length;
              }
            }
          });
        });
        
        setTotalOpportunities(oppCount);
        setTotalOpportunityValue(totalOppValue);
        setTotalSales(salesCount);
        setSalesValue(totalSalesValue);
        setTotalRelationships(relationshipsCount);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [filter, filterByDate]);

  const handleCustomDateApply = () => {
    if (customDateRange) {
      setDateRange(customDateRange);
    }
  };

  const getWidgetSize = (size?: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      case 'full': return 'col-span-full';
      default: return 'col-span-1';
    }
  };

  // Get funnel type context for better user feedback
  const getFunnelContext = () => {
    const vendaFunnels = funnels.filter(f => f.funnelType === 'venda').length;
    const relacionamentoFunnels = funnels.filter(f => f.funnelType === 'relacionamento').length;
    
    if (vendaFunnels > 0 && relacionamentoFunnels > 0) {
      return {
        badge: <Badge variant="outline" className="border-purple-300 text-purple-700">Funis Mistos</Badge>,
        description: `${vendaFunnels} funis de venda • ${relacionamentoFunnels} funis de relacionamento`
      };
    } else if (vendaFunnels > 0) {
      return {
        badge: <Badge variant="default" className="bg-green-100 text-green-800">Apenas Vendas</Badge>,
        description: `${vendaFunnels} funis de venda ativos`
      };
    } else if (relacionamentoFunnels > 0) {
      return {
        badge: <Badge variant="secondary" className="bg-blue-100 text-blue-800">Apenas Relacionamentos</Badge>,
        description: `${relacionamentoFunnels} funis de relacionamento ativos`
      };
    }
    
    return {
      badge: <Badge variant="outline">Sem Funis</Badge>,
      description: "Nenhum funil configurado"
    };
  };

  const funnelContext = getFunnelContext();

  const renderWidget = (widget: any) => {
    const className = getWidgetSize(widget.size);
    
    switch (widget.id) {
      case 'opportunities':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Total de Oportunidades"
            value={loading ? 0 : totalOpportunities}
            subtitle={`${getFilterLabel} • Todos os tipos de funil`}
            icon={Target}
            tooltip="Inclui oportunidades de vendas e relacionamentos"
          />
        );
      case 'opportunity-value':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Valor de Oportunidades de Venda"
            value={loading ? "R$ 0,00" : formatCurrency(totalOpportunityValue)}
            subtitle={`${getFilterLabel} • Apenas funis de venda`}
            icon={DollarSign}
            valueClassName="text-3xl font-bold text-primary"
            tooltip="Valores monetários apenas de funis de venda"
          />
        );
      case 'sales':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Vendas Realizadas"
            value={loading ? 0 : totalSales}
            subtitle={`${getFilterLabel} • Apenas funis de venda`}
            icon={TrendingUp}
            valueClassName="text-3xl font-bold text-green-600"
            tooltip="Vendas concluídas em estágios de vitória de funis de venda"
          />
        );
      case 'relationships':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Relacionamentos Conquistados"
            value={loading ? 0 : totalRelationships}
            subtitle={`${getFilterLabel} • Apenas funis de relacionamento`}
            icon={Heart}
            valueClassName="text-3xl font-bold text-blue-600"
            tooltip="Relacionamentos conquistados em estágios de vitória de funis de relacionamento"
          />
        );
      case 'funnels':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Funis Ativos"
            value={loading ? 0 : funnels.length}
            subtitle={funnelContext.description}
            icon={Building2}
            tooltip="Total de funis configurados no sistema"
          />
        );
      case 'pending-tasks':
        return (
          <PendingTasksCard
            key={widget.id}
            className={className}
          />
        );
      case 'sales-value':
        return (
          <SalesValueCard
            key={widget.id}
            className={className}
            salesValue={salesValue}
            totalSales={totalSales}
            filterLabel={getFilterLabel}
            loading={loading}
          />
        );
      case 'funnel-list':
        return (
          <div key={widget.id} className={className}>
            <FunnelList />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3">
            {funnelContext.badge}
            <span className="text-sm text-muted-foreground">{funnelContext.description}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DashboardCustomizer />
          
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={filter.type} onValueChange={(value) => setFilterType(value as DateFilterType)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value={DateFilterType.ALL}>Vitalício</SelectItem>
                <SelectItem value={DateFilterType.TODAY}>Hoje</SelectItem>
                <SelectItem value={DateFilterType.THIS_WEEK}>Esta semana</SelectItem>
                <SelectItem value={DateFilterType.THIS_MONTH}>Este mês</SelectItem>
                <SelectItem value={DateFilterType.CUSTOM}>Personalizado</SelectItem>
              </SelectContent>
            </Select>
            
            {filter.type === DateFilterType.CUSTOM && (
              <DateRangePicker
                date={customDateRange}
                setDate={setCustomDateRange}
                onApply={handleCustomDateApply}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {enabledWidgets.map(renderWidget)}
      </div>
    </div>
  );
};

export default Dashboard;
