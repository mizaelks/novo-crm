
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PassThroughRateData } from "@/types/stageHistory";

interface PassThroughRatesChartProps {
  data: PassThroughRateData[];
  loading?: boolean;
}

const PassThroughRatesChart = ({ data, loading }: PassThroughRatesChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Passagem por Etapa</CardTitle>
          <CardDescription>Percentual de oportunidades que avançam de cada etapa</CardDescription>
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
          <CardTitle>Taxa de Passagem por Etapa</CardTitle>
          <CardDescription>Percentual de oportunidades que avançam de cada etapa</CardDescription>
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
  const chartData = data.map((stage, index) => ({
    name: stage.stageName,
    rate: Math.round(stage.passThroughRate * 100) / 100, // arredondar para 2 casas decimais
    entries: stage.entriesCount,
    exits: stage.exitsCount,
    current: stage.currentCount
  }));

  // Cores para as barras baseadas na taxa de passagem
  const getBarColor = (rate: number) => {
    if (rate >= 80) return "#22c55e"; // verde - alta taxa
    if (rate >= 60) return "#eab308"; // amarelo - média taxa
    if (rate >= 40) return "#f97316"; // laranja - baixa taxa
    return "#ef4444"; // vermelho - muito baixa taxa
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">Taxa de Passagem</p>
          <div className="space-y-1 text-sm">
            <p>Taxa: <span className="font-medium">{data.rate.toFixed(1)}%</span></p>
            <p>Entradas: <span className="font-medium">{data.entries}</span></p>
            <p>Saídas: <span className="font-medium">{data.exits}</span></p>
            <p>Atualmente: <span className="font-medium">{data.current}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Passagem por Etapa</CardTitle>
        <CardDescription>
          Percentual de oportunidades que avançam de cada etapa do funil
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
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda de cores */}
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#22c55e" }}></div>
            <span>≥80% - Excelente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#eab308" }}></div>
            <span>≥60% - Bom</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f97316" }}></div>
            <span>≥40% - Regular</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444" }}></div>
            <span>&lt;40% - Requer atenção</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassThroughRatesChart;
