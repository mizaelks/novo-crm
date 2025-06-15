import { useState, useEffect, useMemo } from "react";
import { Opportunity, Funnel, Stage } from "@/types";
import { opportunityAPI } from "@/services/opportunityAPI";
import { funnelAPI } from "@/services/funnelAPI";
import { stageAPI } from "@/services/stageAPI";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Archive,
  RefreshCw,
  Settings,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { subDays, startOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDateFilter, DateFilterType, DateRange } from "@/hooks/useDateFilter";
import OpportunityMetricsCards from "@/components/opportunity/OpportunityMetricsCards";
import OpportunityTableFilters from "@/components/opportunity/OpportunityTableFilters";
import OpportunityTableRow from "@/components/opportunity/OpportunityTableRow";

// Interface para configurações de arquivamento
interface ArchiveSettings {
  enabled: boolean;
  period: number; // em dias
  lastRun: string | null;
}

const OpportunityList = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [archivedOpportunities, setArchivedOpportunities] = useState<Opportunity[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('');
  const [filterClient, setFilterClient] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>(DateFilterType.ALL);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showUniqueClients, setShowUniqueClients] = useState(false);
  const [isArchiveSettingsOpen, setIsArchiveSettingsOpen] = useState(false);
  
  // Configurações de arquivamento (salvas no localStorage)
  const [archiveSettings, setArchiveSettings] = useLocalStorage<ArchiveSettings>("archiveSettings", {
    enabled: false,
    period: 30, // 30 dias padrão
    lastRun: null,
  });

  // Get unique clients
  const uniqueClients = useMemo(() => {
    const displayOpportunities = showArchived ? archivedOpportunities : opportunities;
    const clients = displayOpportunities.map(opp => opp.client);
    return [...new Set(clients)].filter(Boolean).sort();
  }, [opportunities, archivedOpportunities, showArchived]);

  // Get available stages based on selected funnel
  const availableStages = useMemo(() => {
    if (!filterFunnel) return stages;
    return stages.filter(stage => stage.funnelId === filterFunnel);
  }, [filterFunnel, stages]);

  // Aplicar filtro de data às oportunidades
  const applyDateFilter = (opportunity: Opportunity): boolean => {
    const createdAt = new Date(opportunity.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case DateFilterType.TODAY:
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return isWithinInterval(createdAt, { start: today, end: todayEnd });
        
      case DateFilterType.YESTERDAY:
        const yesterday = subDays(today, 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return isWithinInterval(createdAt, { start: yesterday, end: yesterdayEnd });
        
      case DateFilterType.THIS_WEEK:
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Segunda-feira
        return createdAt >= startOfCurrentWeek && createdAt <= today;
        
      case DateFilterType.LAST_WEEK:
        const startOfPrevWeek = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
        const endOfPrevWeek = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1);
        return createdAt >= startOfPrevWeek && createdAt <= endOfPrevWeek;
        
      case DateFilterType.THIS_MONTH:
        const startOfCurrentMonth = startOfMonth(today);
        const endOfCurrentMonth = endOfMonth(today);
        return createdAt >= startOfCurrentMonth && createdAt <= endOfCurrentMonth;
        
      case DateFilterType.CUSTOM:
        if (dateRange.from && dateRange.to) {
          // Ajustar o fim do dia para incluir todas as oportunidades do dia final
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return createdAt >= dateRange.from && createdAt <= endDate;
        }
        return true;
        
      case DateFilterType.ALL:
      default:
        return true;
    }
  };

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    const displayOpportunities = showArchived ? archivedOpportunities : opportunities;
    
    return displayOpportunities.filter(opp => {
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
      
      // Apply date filter
      const matchesDate = applyDateFilter(opp);
      
      return matchesSearch && matchesFunnel && matchesStage && matchesClient && matchesDate;
    });
  }, [
    opportunities, 
    archivedOpportunities, 
    showArchived, 
    searchTerm, 
    filterFunnel, 
    filterStage, 
    filterClient, 
    dateFilter, 
    dateRange
  ]);

  // Get unique clients view
  const clientSummary = useMemo(() => {
    if (!showUniqueClients) return null;
    
    const summary = uniqueClients.map(client => {
      const displayOpportunities = showArchived ? archivedOpportunities : opportunities;
      const clientOpportunities = displayOpportunities.filter(
        opp => opp.client === client && applyDateFilter(opp)
      );
      
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
  }, [opportunities, archivedOpportunities, uniqueClients, showUniqueClients, showArchived, dateFilter, dateRange]);

  // Função para verificar se uma oportunidade tem alerta
  const getStageAlertStatus = (opportunity: Opportunity): boolean => {
    const stage = stages.find(s => s.id === opportunity.stageId);
    if (!stage?.alertConfig?.enabled) return false;
    
    const stageChangeDate = opportunity.lastStageChangeAt || opportunity.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stageChangeDate.getTime());
    const daysInStage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return daysInStage >= stage.alertConfig.maxDaysInStage;
  };

  // Função para arquivar/desarquivar oportunidades
  const archiveOpportunity = async (opportunity: Opportunity, archive: boolean) => {
    try {
      // Em um sistema real, você poderia adicionar um campo "archived" à tabela
      // Aqui, estamos apenas movendo entre os arrays de estado para simular
      if (archive) {
        setOpportunities(ops => ops.filter(op => op.id !== opportunity.id));
        setArchivedOpportunities(ops => [...ops, opportunity]);
        toast.success("Oportunidade arquivada com sucesso");
      } else {
        setArchivedOpportunities(ops => ops.filter(op => op.id !== opportunity.id));
        setOpportunities(ops => [...ops, opportunity]);
        toast.success("Oportunidade restaurada com sucesso");
      }
    } catch (error) {
      console.error(`Erro ao ${archive ? 'arquivar' : 'restaurar'} oportunidade:`, error);
      toast.error(`Erro ao ${archive ? 'arquivar' : 'restaurar'} oportunidade`);
    }
  };

  // Função para arquivar oportunidades automaticamente
  const processAutoArchive = () => {
    if (!archiveSettings.enabled) return;
    
    const cutoffDate = subDays(new Date(), archiveSettings.period);
    
    // Encontrar oportunidades antigas para arquivar
    const opportunitiesToArchive = opportunities.filter(
      opp => new Date(opp.createdAt) < cutoffDate
    );
    
    // Arquivar as oportunidades encontradas
    if (opportunitiesToArchive.length > 0) {
      setOpportunities(ops => ops.filter(op => !opportunitiesToArchive.some(o => o.id === o.id)));
      setArchivedOpportunities(ops => [...ops, ...opportunitiesToArchive]);
      
      toast.success(`${opportunitiesToArchive.length} oportunidades arquivadas automaticamente`);
    }
    
    // Atualizar a data da última execução
    setArchiveSettings({
      ...archiveSettings,
      lastRun: new Date().toISOString()
    });
  };

  // Verificar arquivamento automático na inicialização
  useEffect(() => {
    if (archiveSettings.enabled) {
      const lastRun = archiveSettings.lastRun 
        ? new Date(archiveSettings.lastRun) 
        : null;
      
      // Se nunca foi executado ou a última execução foi há mais de um dia
      if (!lastRun || (new Date().getTime() - lastRun.getTime() > 24 * 60 * 60 * 1000)) {
        processAutoArchive();
      }
    }
  }, [archiveSettings.enabled, opportunities]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [opportunitiesData, funnelsData] = await Promise.all([
          opportunityAPI.getAll(),
          funnelAPI.getAll()
        ]);
        
        // Para fins de demonstração, simulamos oportunidades arquivadas
        setOpportunities(opportunitiesData);
        setArchivedOpportunities([]); // Inicialmente vazio, na implementação real seriam buscadas do backend
        
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
        setArchivedOpportunities(archivedOpportunities.filter(opp => opp.id !== id));
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
        <h1 className="text-3xl font-bold">Relatório de Oportunidades</h1>
        <div className="animate-pulse bg-muted h-96 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatório de Oportunidades</h1>
          <p className="text-muted-foreground">
            Visão completa e análise detalhada das suas oportunidades {showArchived ? "arquivadas" : "ativas"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" /> 
            {showArchived ? "Ver ativas" : "Ver arquivadas"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
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
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> 
            Atualizar
          </Button>
          
          <Dialog open={isArchiveSettingsOpen} onOpenChange={setIsArchiveSettingsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" /> 
                Configurar arquivamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de arquivamento automático</DialogTitle>
                <DialogDescription>
                  Configure quando oportunidades devem ser arquivadas automaticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Ativar arquivamento automático</label>
                    <p className="text-sm text-muted-foreground">
                      Arquiva automaticamente oportunidades antigas
                    </p>
                  </div>
                  <Switch
                    checked={archiveSettings.enabled}
                    onCheckedChange={(checked) => setArchiveSettings({
                      ...archiveSettings,
                      enabled: checked
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Arquivar oportunidades mais antigas que
                  </label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="1"
                      value={archiveSettings.period} 
                      onChange={(e) => setArchiveSettings({
                        ...archiveSettings,
                        period: parseInt(e.target.value) || 30
                      })}
                      className="w-20"
                    />
                    <span>dias</span>
                  </div>
                </div>
                
                {archiveSettings.lastRun && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Última execução: {formatDateBRT(new Date(archiveSettings.lastRun))}
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => processAutoArchive()} disabled={!archiveSettings.enabled}>
                  Executar agora
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <OpportunityMetricsCards 
        opportunities={filteredOpportunities}
        stages={stages}
        showArchived={showArchived}
      />
      
      <Card>
        <CardHeader className="pb-3">
          <OpportunityTableFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterFunnel={filterFunnel}
            setFilterFunnel={setFilterFunnel}
            filterStage={filterStage}
            setFilterStage={setFilterStage}
            filterClient={filterClient}
            setFilterClient={setFilterClient}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            showUniqueClients={showUniqueClients}
            setShowUniqueClients={setShowUniqueClients}
            funnels={funnels}
            availableStages={availableStages}
            uniqueClients={uniqueClients}
          />
        </CardHeader>
        <CardContent>
          {showUniqueClients ? (
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
                    <OpportunityTableRow
                      key={opp.id}
                      opportunity={opp}
                      getFunnelName={getFunnelName}
                      getStageName={getStageName}
                      getStageAlertStatus={getStageAlertStatus}
                      showArchived={showArchived}
                      onArchive={(opportunity, archive) => {
                        try {
                          if (archive) {
                            setOpportunities(ops => ops.filter(op => op.id !== opportunity.id));
                            setArchivedOpportunities(ops => [...ops, opportunity]);
                            toast.success("Oportunidade arquivada com sucesso");
                          } else {
                            setArchivedOpportunities(ops => ops.filter(op => op.id !== opportunity.id));
                            setOpportunities(ops => [...ops, opportunity]);
                            toast.success("Oportunidade restaurada com sucesso");
                          }
                        } catch (error) {
                          console.error(`Erro ao ${archive ? 'arquivar' : 'restaurar'} oportunidade:`, error);
                          toast.error(`Erro ao ${archive ? 'arquivar' : 'restaurar'} oportunidade`);
                        }
                      }}
                      onDelete={async (id) => {
                        try {
                          const success = await opportunityAPI.delete(id);
                          if (success) {
                            setOpportunities(opportunities.filter(opp => opp.id !== id));
                            setArchivedOpportunities(archivedOpportunities.filter(opp => opp.id !== id));
                            toast.success("Oportunidade excluída com sucesso!");
                          } else {
                            toast.error("Erro ao excluir oportunidade");
                          }
                        } catch (error) {
                          console.error("Error deleting opportunity:", error);
                          toast.error("Erro ao excluir oportunidade");
                        }
                      }}
                    />
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
