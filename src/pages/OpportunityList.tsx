
import { useState, useEffect } from "react";
import { Opportunity } from "@/types";
import { opportunityAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const OpportunityList = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const data = await opportunityAPI.getAll();
        setOpportunities(data);
      } catch (error) {
        console.error("Error loading opportunities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Oportunidades</h1>
        <div className="animate-pulse bg-muted h-96 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Oportunidades</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Todas as Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma oportunidade encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell>{opp.title}</TableCell>
                    <TableCell>{opp.client}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(opp.value)}
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat('pt-BR').format(
                        new Date(opp.createdAt)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {opp.scheduledActions?.some(
                          action => action.status === 'pending'
                        ) 
                          ? "Com ações agendadas"
                          : "Sem ações agendadas"
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityList;
