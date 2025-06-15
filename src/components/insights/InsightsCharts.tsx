
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatCurrency } from "@/services/utils/dateUtils";

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

interface InsightsChartsProps {
  conversionData: ConversionData[];
  stageDistribution: any[];
  valueOverTime: ValueData[];
}

const InsightsCharts = ({ conversionData, stageDistribution, valueOverTime }: InsightsChartsProps) => {
  return (
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
  );
};

export default InsightsCharts;
