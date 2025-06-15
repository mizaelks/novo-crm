
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Opportunity, Stage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle 
} from "lucide-react";

interface OpportunityMetricsCardsProps {
  opportunities: Opportunity[];
  stages: Stage[];
  showArchived: boolean;
}

const OpportunityMetricsCards = ({ 
  opportunities, 
  stages, 
  showArchived 
}: OpportunityMetricsCardsProps) => {
  
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const uniqueClients = new Set(opportunities.map(opp => opp.client)).size;
  
  // Calcular oportunidades com alertas
  const opportunitiesWithAlerts = opportunities.filter(opp => {
    const stage = stages.find(s => s.id === opp.stageId);
    if (!stage?.alertConfig?.enabled) return false;
    
    const stageChangeDate = opp.lastStageChangeAt || opp.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stageChangeDate.getTime());
    const daysInStage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return daysInStage >= stage.alertConfig.maxDaysInStage;
  }).length;

  // Calcular valor médio por oportunidade
  const averageValue = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;

  const metrics = [
    {
      title: showArchived ? "Oportunidades Arquivadas" : "Oportunidades Ativas",
      value: totalOpportunities.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Valor Total",
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Clientes Únicos",
      value: uniqueClients.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Valor Médio",
      value: formatCurrency(averageValue),
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  if (!showArchived && opportunitiesWithAlerts > 0) {
    metrics.push({
      title: "Com Alertas",
      value: opportunitiesWithAlerts.toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OpportunityMetricsCards;
