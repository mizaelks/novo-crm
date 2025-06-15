
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatCurrency } from "@/services/utils/dateUtils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4', '#95E1D3'];

interface ValueData {
  month: string;
  value: number;
}

interface InsightsChartsProps {
  stageDistribution: any[];
  valueOverTime: ValueData[];
}

const InsightsCharts = ({ stageDistribution, valueOverTime }: InsightsChartsProps) => {
  return (
    <Tabs defaultValue="distribution" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="distribution">Distribuição por Etapa</TabsTrigger>
        <TabsTrigger value="timeline">Valor ao Longo do Tempo</TabsTrigger>
      </TabsList>
      
      <TabsContent value="distribution">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Oportunidades por Etapa</CardTitle>
            <p className="text-sm text-muted-foreground">
              Quantidade total de oportunidades em cada etapa do funil
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => 
                    percent > 5 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Oportunidades']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>Valor de Oportunidades ao Longo do Tempo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Evolução do valor total das oportunidades nos últimos meses
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={valueOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                  labelStyle={{ color: '#000' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', r: 6 }}
                  activeDot={{ r: 8, fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default InsightsCharts;
