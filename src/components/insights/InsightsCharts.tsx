
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ValueData } from "@/hooks/insights/types";
import PassThroughRatesChart from "./PassThroughRatesChart";
import StageVelocityChart from "./StageVelocityChart";
import { usePassThroughRates } from "@/hooks/usePassThroughRates";
import { formatCurrency } from "@/services/utils/dateUtils";

interface InsightsChartsProps {
  stageDistribution: any[];
  valueOverTime: ValueData[];
  selectedFunnel?: string;
  funnelType?: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

const InsightsCharts = memo(({ stageDistribution, valueOverTime, selectedFunnel, funnelType = 'all' }: InsightsChartsProps) => {
  const { 
    passThroughRates, 
    stageVelocities, 
    loading: passThroughLoading 
  } = usePassThroughRates(selectedFunnel !== "all" ? selectedFunnel : null);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  // Determinar título e formatação do segundo gráfico baseado no tipo de funil
  const getTimeSeriesConfig = () => {
    switch (funnelType) {
      case 'venda':
        return {
          title: 'Valor ao Longo do Tempo',
          tooltipFormatter: (value: any) => [formatCurrency(Number(value)), "Valor"],
          yAxisFormatter: (value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`
        };
      case 'relacionamento':
        return {
          title: 'Oportunidades ao Longo do Tempo',
          tooltipFormatter: (value: any) => [value, "Oportunidades"],
          yAxisFormatter: (value: any) => value.toString()
        };
      case 'mixed':
      case 'all':
      default:
        return {
          title: 'Métricas ao Longo do Tempo',
          tooltipFormatter: (value: any) => [value, "Valor/Oportunidades"],
          yAxisFormatter: (value: any) => value.toString()
        };
    }
  };

  const timeSeriesConfig = getTimeSeriesConfig();

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Existing charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Oportunidades"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{timeSeriesConfig.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={valueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={timeSeriesConfig.yAxisFormatter} />
                  <Tooltip formatter={timeSeriesConfig.tooltipFormatter} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New pass-through and velocity charts */}
      {selectedFunnel && selectedFunnel !== "all" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PassThroughRatesChart 
            data={passThroughRates} 
            loading={passThroughLoading}
          />
          
          <StageVelocityChart 
            data={stageVelocities} 
            loading={passThroughLoading}
          />
        </div>
      )}
    </div>
  );
});

InsightsCharts.displayName = "InsightsCharts";

export default InsightsCharts;
