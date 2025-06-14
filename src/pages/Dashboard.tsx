
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Funnel } from "@/types";
import { funnelAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FunnelList from "@/components/funnel/FunnelList";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";
import { formatCurrency } from "@/services/utils/dateUtils";
import { CalendarDays } from "lucide-react";

const Dashboard = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [totalOpportunityValue, setTotalOpportunityValue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [salesValue, setSalesValue] = useState(0);
  
  const { filter, setFilterType, filterByDate } = useDateFilter();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                totalOpportunities
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getFilterLabel()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total de Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                formatCurrency(totalOpportunityValue)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getFilterLabel()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {loading ? (
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              ) : (
                totalSales
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getFilterLabel()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Funis Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? (
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              ) : (
                funnels.length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total
            </p>
          </CardContent>
        </Card>
      </div>
      
      {totalSales > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valor das Vendas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {loading ? (
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              ) : (
                formatCurrency(salesValue)
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {getFilterLabel()} • {totalSales} {totalSales === 1 ? 'venda realizada' : 'vendas realizadas'}
            </p>
          </CardContent>
        </Card>
      )}
      
      <FunnelList />
    </div>
  );
};

export default Dashboard;
