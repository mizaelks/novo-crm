
import { useState, useEffect, useMemo } from "react";
import { Opportunity, Funnel, Stage } from "@/types";
import { opportunityAPI } from "@/services/opportunityAPI";
import { funnelAPI } from "@/services/funnelAPI";
import { stageAPI } from "@/services/stageAPI";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { subDays, startOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useDateFilter, DateFilterType, DateRange } from "@/hooks/useDateFilter";
import { useArchiveSettings } from "@/hooks/useArchiveSettings";
import { useOpportunityOperations } from "@/hooks/useOpportunityOperations";
import OpportunityMetricsCards from "@/components/opportunity/OpportunityMetricsCards";
import OpportunityTableFilters from "@/components/opportunity/OpportunityTableFilters";
import OpportunityListHeader from "@/components/opportunity/OpportunityListHeader";
import ClientSummaryTable from "@/components/opportunity/ClientSummaryTable";
import OpportunitiesTable from "@/components/opportunity/OpportunitiesTable";

const OpportunityList = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
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
  
  const { archiveSettings, setArchiveSettings, processAutoArchive } = useArchiveSettings();
  const { loading: opsLoading, archiveOpportunity, handleDeleteOpportunity, refreshData } = useOpportunityOperations();

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
      
      // Apply date filter
      const matchesDate = applyDateFilter(opp);
      
      return matchesSearch && matchesFunnel && matchesStage && matchesClient && matchesDate;
    });
  }, [
    opportunities, 
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
      const clientOpportunities = opportunities.filter(
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
  }, [opportunities, uniqueClients, showUniqueClients, dateFilter, dateRange]);

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

  // Load opportunities based on archive view
  const loadOpportunities = async () => {
    try {
      const data = showArchived 
        ? await opportunityAPI.getArchived()
        : await opportunityAPI.getAll(false);
      setOpportunities(data);
    } catch (error) {
      console.error("Error loading opportunities:", error);
      toast.error("Erro ao carregar oportunidades");
    }
  };

  // Load opportunities when archive view changes
  useEffect(() => {
    loadOpportunities();
  }, [showArchived]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [opportunitiesData, funnelsData] = await Promise.all([
          showArchived ? opportunityAPI.getArchived() : opportunityAPI.getAll(false),
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

  const handleArchive = async (opportunity: Opportunity, archive: boolean) => {
    const success = await archiveOpportunity(opportunity, archive);
    if (success) {
      await loadOpportunities();
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    const success = await handleDeleteOpportunity(id);
    if (success) {
      await loadOpportunities();
    }
    return success;
  };

  const handleRefresh = () => {
    refreshData(loadOpportunities);
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
      <OpportunityListHeader
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        refreshData={handleRefresh}
        loading={loading || opsLoading}
        archiveSettings={archiveSettings}
        setArchiveSettings={setArchiveSettings}
        processAutoArchive={processAutoArchive}
        isArchiveSettingsOpen={isArchiveSettingsOpen}
        setIsArchiveSettingsOpen={setIsArchiveSettingsOpen}
      />

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
            <ClientSummaryTable
              clientSummary={clientSummary || []}
              getFunnelName={getFunnelName}
              getStageName={getStageName}
            />
          ) : (
            <OpportunitiesTable
              opportunities={filteredOpportunities}
              getFunnelName={getFunnelName}
              getStageName={getStageName}
              getStageAlertStatus={getStageAlertStatus}
              showArchived={showArchived}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityList;
