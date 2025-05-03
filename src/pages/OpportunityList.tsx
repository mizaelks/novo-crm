import { useState, useEffect, useMemo } from "react";
import { Opportunity, Funnel, Stage } from "@/types";
import { opportunityAPI, funnelAPI, stageAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  Users,
  Archive,
  CalendarIcon,
  Settings,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { pt } from "date-fns/locale";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DateFilterType, DateRange } from "@/hooks/useDateFilter";

// Enum para os filtros de data
enum DateFilterType {
  ALL = "all",
  TODAY = "today",
  YESTERDAY = "yesterday",
  THIS_WEEK = "thisWeek",
  LAST_WEEK = "lastWeek",
  THIS_MONTH = "thisMonth",
  CUSTOM = "custom",
}

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
      setOpportunities(ops => ops.filter(op => !opportunitiesToArchive.some(o => o.id === op.id)));
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

  // Função de callback para o seletor de intervalo de datas
  const handleDateRangeSelect = (range: DateRange | any) => {
    setDateRange(range);
  };

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
  
  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case DateFilterType.TODAY:
        return "Hoje";
      case DateFilterType.YESTERDAY:
        return "Ontem";
      case DateFilterType.THIS_WEEK:
        return "Esta semana";
      case DateFilterType.LAST_WEEK:
        return "Semana passada";
      case DateFilterType.THIS_MONTH:
        return "Este mês";
      case DateFilterType.CUSTOM:
        return dateRange.from && dateRange.to
          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
          : "Personalizado";
      default:
        return "Todas as datas";
    }
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
        <div>
          <h1 className="text-3xl font-bold">Oportunidades</h1>
          <p className="text-muted-foreground">
            {showArchived ? "Oportunidades arquivadas" : "Oportunidades ativas"}
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
            onClick={refreshData}
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
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
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
                setFilterFunnel(value === "all" ? "" : value);
                setFilterStage(""); // Reset stage filter when funnel changes
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar funil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os funis</SelectItem>
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
                onValueChange={value => setFilterStage(value === "all" ? "" : value)}
                disabled={!filterFunnel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as etapas</SelectItem>
                  {availableStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterClient} onValueChange={value => setFilterClient(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {uniqueClients.map(client => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getDateFilterLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="space-y-2">
                      {Object.values(DateFilterType).map((type) => (
                        <Button
                          key={type}
                          variant={dateFilter === type ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setDateFilter(type);
                            if (type !== DateFilterType.CUSTOM) {
                              setDateRange({ from: undefined, to: undefined });
                            }
                          }}
                        >
                          {type === DateFilterType.ALL && "Todas as datas"}
                          {type === DateFilterType.TODAY && "Hoje"}
                          {type === DateFilterType.YESTERDAY && "Ontem"}
                          {type === DateFilterType.THIS_WEEK && "Esta semana"}
                          {type === DateFilterType.LAST_WEEK && "Semana passada"}
                          {type === DateFilterType.THIS_MONTH && "Este mês"}
                          {type === DateFilterType.CUSTOM && "Personalizado"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {dateFilter === DateFilterType.CUSTOM && (
                    <div className="p-3">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={1}
                        locale={pt}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>
                  )}
                </PopoverContent>
              </Popover>
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
            {showUniqueClients ? "Clientes Únicos" : "Oportunidades"}
          </CardTitle>
          {showArchived && (
            <CardDescription>
              Oportunidades arquivadas
            </CardDescription>
          )}
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => archiveOpportunity(opp, !showArchived)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          
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
                        </div>
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
