
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Funnel } from "@/types";
import { funnelAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FunnelList from "@/components/funnel/FunnelList";

const Dashboard = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const funnelsData = await funnelAPI.getAll();
        
        setFunnels(funnelsData);
        
        // Calculate statistics
        let oppCount = 0;
        let valueSum = 0;
        
        funnelsData.forEach(funnel => {
          funnel.stages.forEach(stage => {
            oppCount += stage.opportunities.length;
            
            stage.opportunities.forEach(opp => {
              valueSum += opp.value;
            });
          });
        });
        
        setTotalOpportunities(oppCount);
        setTotalValue(valueSum);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(totalValue)
              )}
            </div>
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
          </CardContent>
        </Card>
      </div>
      
      <FunnelList />
    </div>
  );
};

export default Dashboard;
