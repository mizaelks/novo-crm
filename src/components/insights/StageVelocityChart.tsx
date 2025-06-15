
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StageVelocityData } from "@/types/stageHistory";

interface StageVelocityChartProps {
  data: StageVelocityData[];
  loading?: boolean;
}

const StageVelocityChart = ({ data, loading }: StageVelocityChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Velocidade por Etapa</CardTitle>
          <CardDescription>Tempo médio que oportunidades permanecem em cada etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse bg-muted h-full w-full rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Velocidade por Etapa</CardTitle>
          <CardDescription>Tempo médio que oportunidades permanecem em cada etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map(stage => ({
    name: stage.stageName,
    days: Math.round(stage.averageDaysInStage * 100) / 100, // arredondar para 2 casas decimais
    opportunities: stage.totalOpportunities
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">Tempo Médio na Etapa</p>
          <div className="space-y-1 text-sm">
            <p>Dias: <span className="font-medium">{data.days.toFixed(1)}</span></p>
            <p>Oportunidades analisadas: <span className="font-medium">{data.opportunities}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Velocidade por Etapa</CardTitle>
        <CardDescription>
          Tempo médio (em dias) que oportunidades permanecem em cada etapa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}d`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="days" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageVelocityChart;
