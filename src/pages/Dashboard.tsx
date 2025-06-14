
import { useState, useEffect } from "react";
import { Funnel } from "@/types";
import { funnelAPI } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FunnelList from "@/components/funnel/FunnelList";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";
import { formatCurrency } from "@/services/utils/dateUtils";
import { CalendarDays, TrendingUp, DollarSign, Target, Building2 } from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import PendingTasksCard from "@/components/dashboard/PendingTasksCard";
import SalesValueCard from "@/components/dashboard/SalesValueCard";
import DashboardCustomizer from "@/components/dashboard/DashboardCustomizer";

const Dashboard = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [totalOpportunityValue, setTotalOpportunityValue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [salesValue, setSalesValue] = useState(0);
  
  const { filter, setFilterType, filterByDate } = useDateFilter();
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
        
        funnelsData.forEach(funnel => {
          funnel.stages.forEach(stage => {
            // Filter opportunities by date
            const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
            
            // Count all opportunities
            oppCount += filteredOpportunities.length;
            
            // Sum all opportunity values
            filteredOpportunities.forEach(opp => {
              totalOppValue += opp.value;
            });
            
            // Count and sum values for win stages only
            if (stage.isWinStage) {
              salesCount += filteredOpportunities.length;
              filteredOpportunities.forEach(opp => {
                totalSalesValue += opp.value;
              });
            }
          });
        });
        
        setTotalOpportunities(oppCount);
        setTotalOpportunityValue(totalOppValue);
        setTotalSales(salesCount);
        setSalesValue(totalSalesValue);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [filter, filterByDate]);

  const getFilterLabel = () => {
    switch (filter.type) {
      case DateFilterType.TODAY:
        return "Hoje";
      case DateFilterType.THIS_WEEK:
        return "Esta semana";
      case DateFilterType.THIS_MONTH:
        return "Este mês";
      case DateFilterType.ALL:
      default:
        return "Vitalício";
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
            subtitle={getFilterLabel()}
            icon={Target}
          />
        );
      case 'opportunity-value':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Valor Total de Oportunidades"
            value={loading ? "R$ 0,00" : formatCurrency(totalOpportunityValue)}
            subtitle={getFilterLabel()}
            icon={DollarSign}
            valueClassName="text-3xl font-bold text-primary"
          />
        );
      case 'sales':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Vendas Realizadas"
            value={loading ? 0 : totalSales}
            subtitle={getFilterLabel()}
            icon={TrendingUp}
            valueClassName="text-3xl font-bold text-green-600"
          />
        );
      case 'funnels':
        return (
          <StatsCard
            key={widget.id}
            className={className}
            title="Funis Ativos"
            value={loading ? 0 : funnels.length}
            subtitle="Total"
            icon={Building2}
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
            filterLabel={getFilterLabel()}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <DashboardCustomizer />
          
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={filter.type} onValueChange={(value) => setFilterType(value as DateFilterType)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DateFilterType.ALL}>Vitalício</SelectItem>
                <SelectItem value={DateFilterType.TODAY}>Hoje</SelectItem>
                <SelectItem value={DateFilterType.THIS_WEEK}>Esta semana</SelectItem>
                <SelectItem value={DateFilterType.THIS_MONTH}>Este mês</SelectItem>
              </SelectContent>
            </Select>
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
