
import { useState, useEffect, useMemo } from "react";
import { Opportunity, Funnel, Stage } from "@/types";
import { opportunityAPI, funnelAPI, stageAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";

const OpportunityList = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('');
  const [filterClient, setFilterClient] = useState<string>('');
  const [showUniqueClients, setShowUniqueClients] = useState(false);

  // Get unique clients
  const uniqueClients = useMemo(() => {
    const clients = opportunities.map(opp => opp.client);
    return [...new Set(clients)].filter(Boolean).sort();
  }, [opportunities]);

  // Get available stages based on selected funnel
  const availableStages = useMemo(() => {
    if (!filterFunnel) return stages;
    return stages.filter(stage => stage.funnelId === filterFunnel);
  }, [filterFunnel, stages]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // Apply search filter
      const matchesSearch = searchTerm ? 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opp.company && opp.company.toLowerCase().includes(searchTerm.toLowerCase())) :
        true;
      
      // Apply funnel filter
      const matchesFunnel = filterFunnel ? opp.funnelId === filterFunnel : true;
      
      // Apply stage filter
      const matchesStage = filterStage ? opp.stageId === filterStage : true;
      
      // Apply client filter
      const matchesClient = filterClient ? opp.client === filterClient : true;
      
      return matchesSearch && matchesFunnel && matchesStage && matchesClient;
    });
  }, [opportunities, searchTerm, filterFunnel, filterStage, filterClient]);

  // Get unique clients view
  const clientSummary = useMemo(() => {
    if (!showUniqueClients) return null;
    
    const summary = uniqueClients.map(client => {
      const clientOpportunities = opportunities.filter(opp => opp.client === client);
      const totalValue = clientOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const opportunityCount = clientOpportunities.length;
      
      // Find the most recent opportunity for this client
      const mostRecent = clientOpportunities.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }, null as Opportunity | null);
      
      return {
        client,
        opportunityCount,
        totalValue,
        mostRecentDate: mostRecent ? mostRecent.createdAt : null,
        funnelId: mostRecent ? mostRecent.funnelId : null,
        stageId: mostRecent ? mostRecent.stageId : null
      };
    });
    
    return summary;
  }, [opportunities, uniqueClients, showUniqueClients]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [opportunitiesData, funnelsData] = await Promise.all([
          opportunityAPI.getAll(),
          funnelAPI.getAll()
        ]);
        
        setOpportunities(opportunitiesData);
        setFunnels(funnelsData);
        
        // Load all stages from all funnels
        const allStages: Stage[] = [];
        for (const funnel of funnelsData) {
          const stagesData = await stageAPI.getByFunnelId(funnel.id);
          allStages.push(...stagesData);
        }
        setStages(allStages);
      } catch (error) {
        console.error("Error loading opportunities:", error);
        toast.error("Erro ao carregar oportunidades");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteOpportunity = async (id: string) => {
    try {
      const success = await opportunityAPI.delete(id);
      if (success) {
        setOpportunities(opportunities.filter(opp => opp.id !== id));
        toast.success("Oportunidade excluída com sucesso!");
      } else {
        toast.error("Erro ao excluir oportunidade");
      }
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast.error("Erro ao excluir oportunidade");
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await opportunityAPI.getAll();
      setOpportunities(data);
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
  };

  const getFunnelName = (funnelId: string): string => {
    const funnel = funnels.find(f => f.id === funnelId);
    return funnel ? funnel.name : "Funil não encontrado";
  };

  const getStageName = (stageId: string): string => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : "Etapa não encontrada";
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Oportunidades</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> 
          Atualizar
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div>
              <Select value={filterFunnel} onValueChange={value => {
                setFilterFunnel(value);
                setFilterStage(''); // Reset stage filter when funnel changes
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar funil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os funis</SelectItem>
                  {funnels.map(funnel => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={filterStage} 
                onValueChange={setFilterStage}
                disabled={!filterFunnel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as etapas</SelectItem>
                  {availableStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os clientes</SelectItem>
                  {uniqueClients.map(client => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant={showUniqueClients ? "default" : "outline"}
                onClick={() => setShowUniqueClients(!showUniqueClients)}
                className="whitespace-nowrap"
              >
                <Users className="h-4 w-4 mr-2" />
                {showUniqueClients ? "Ver todas oportunidades" : "Ver clientes únicos"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {showUniqueClients ? "Clientes Únicos" : "Todas as Oportunidades"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showUniqueClients ? (
            // Display unique clients view
            clientSummary && clientSummary.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>N° de Oportunidades</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Última Oportunidade</TableHead>
                    <TableHead>Funil</TableHead>
                    <TableHead>Etapa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientSummary.map(summary => (
                    <TableRow key={summary.client}>
                      <TableCell>{summary.client}</TableCell>
                      <TableCell>{summary.opportunityCount}</TableCell>
                      <TableCell>{formatCurrency(summary.totalValue)}</TableCell>
                      <TableCell>
                        {summary.mostRecentDate ? formatDateBRT(summary.mostRecentDate) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {summary.funnelId ? getFunnelName(summary.funnelId) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {summary.stageId ? getStageName(summary.stageId) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado com os filtros atuais
              </div>
            )
          ) : (
            // Display normal opportunities view
            filteredOpportunities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Funil</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell>{opp.title}</TableCell>
                      <TableCell>{opp.client}</TableCell>
                      <TableCell>{formatCurrency(opp.value)}</TableCell>
                      <TableCell>{formatDateBRT(opp.createdAt)}</TableCell>
                      <TableCell>{getFunnelName(opp.funnelId)}</TableCell>
                      <TableCell>{getStageName(opp.stageId)}</TableCell>
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
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-8 w-8 p-0" 
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir oportunidade</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a 
                                oportunidade "{opp.title}" do cliente {opp.client} e removerá 
                                todos os dados associados a ela.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOpportunity(opp.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma oportunidade encontrada com os filtros atuais
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityList;
