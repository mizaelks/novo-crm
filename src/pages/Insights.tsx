
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";
import { formatCurrency } from "@/services/utils/dateUtils";
import { CalendarDays, TrendingUp, DollarSign, Target, Zap } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import DateRangePicker from "@/components/dashboard/DateRangePicker";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface ConversionData {
  stageName: string;
  opportunities: number;
  conversionRate: number;
}

interface ValueData {
  month: string;
  value: number;
}

const Insights = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [stageDistribution, setStageDistribution] = useState<any[]>([]);
  const [valueOverTime, setValueOverTime] = useState<ValueData[]>([]);
  
  const { filter, setFilterType, setDateRange, filterByDate, getFilterLabel } = useDateFilter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const funnelsData = await funnelAPI.getAll();
        setFunnels(funnelsData);
        
        // Process data for charts
        const filteredFunnels = selectedFunnel === "all" 
          ? funnelsData 
          : funnelsData.filter(f => f.id === selectedFunnel);
        
        processConversionData(filteredFunnels);
        processStageDistribution(filteredFunnels);
        processValueOverTime(filteredFunnels);
      } catch (error) {
        console.error("Error loading insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedFunnel, filter, filterByDate]);

  const processConversionData = (funnelsData: Funnel[]) => {
    const stageData: { [key: string]: { total: number, converted: number } } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach((stage, index) => {
        if (!stageData[stage.name]) {
          stageData[stage.name] = { total: 0, converted: 0 };
        }
        
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        stageData[stage.name].total += filteredOpportunities.length;
        
        // Calculate conversions (opportunities that moved to next stage)
        if (index < funnel.stages.length - 1) {
          const nextStage = funnel.stages[index + 1];
          const nextStageOpps = filterByDate(nextStage.opportunities, 'createdAt');
          stageData[stage.name].converted += nextStageOpps.length;
        }
      });
    });

    const conversionArray = Object.entries(stageData).map(([stageName, data]) => ({
      stageName,
      opportunities: data.total,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0
    }));

    setConversionData(conversionArray);
  };

  const processStageDistribution = (funnelsData: Funnel[]) => {
    const stageData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        if (!stageData[stage.name]) {
          stageData[stage.name] = 0;
        }
        stageData[stage.name] += filteredOpportunities.length;
      });
    });

    const distributionArray = Object.entries(stageData).map(([name, value]) => ({
      name,
      value
    }));

    setStageDistribution(distributionArray);
  };

  const processValueOverTime = (funnelsData: Funnel[]) => {
    const monthData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        stage.opportunities.forEach(opp => {
          const month = new Date(opp.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          if (!monthData[month]) {
            monthData[month] = 0;
          }
          monthData[month] += opp.value;
        });
      });
    });

    const valueArray = Object.entries(monthData).map(([month, value]) => ({
      month,
      value
    }));

    setValueOverTime(valueArray.slice(-6)); // Last 6 months
  };

  const getTotalStats = () => {
    const filteredFunnels = selectedFunnel === "all" 
      ? funnels 
      : funnels.filter(f => f.id === selectedFunnel);
    
    let totalOpportunities = 0;
    let totalValue = 0;
    let totalSales = 0;
    let totalSalesValue = 0;

    filteredFunnels.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        totalOpportunities += filteredOpportunities.length;
        
        filteredOpportunities.forEach(opp => {
          totalValue += opp.value;
          if (stage.isWinStage) {
            totalSales++;
            totalSalesValue += opp.value;
          }
        });
      });
    });

    return { totalOpportunities, totalValue, totalSales, totalSalesValue };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insights</h1>
        
        <div className="flex items-center gap-4">
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar funil" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">Todos os funis</SelectItem>
              {funnels.map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
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

      {/* Charts */}
      <Tabs defaultValue="conversion" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversion">Taxa de Conversão</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição por Etapa</TabsTrigger>
          <TabsTrigger value="timeline">Valor ao Longo do Tempo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stageName" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'conversionRate' ? `${value}%` : value,
                    name === 'conversionRate' ? 'Taxa de Conversão' : 'Oportunidades'
                  ]} />
                  <Bar dataKey="opportunities" fill="#8884d8" name="Oportunidades" />
                  <Bar dataKey="conversionRate" fill="#82ca9d" name="Taxa de Conversão %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Oportunidades por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Valor de Oportunidades ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={valueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor']} />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Insights;
