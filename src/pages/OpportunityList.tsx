import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDateFilter, DateFilterType, DateRange } from "@/hooks/useDateFilter";
import { useArchiveSettings } from "@/hooks/useArchiveSettings";
import { useOpportunityOperations } from "@/hooks/useOpportunityOperations";
import { useOpportunityData } from "@/hooks/useOpportunityData";
import { useOpportunityFilters } from "@/hooks/useOpportunityFilters";
import { useClientSummary } from "@/hooks/useClientSummary";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import OpportunityMetricsCards from "@/components/opportunity/OpportunityMetricsCards";
import OpportunityTableFilters from "@/components/opportunity/OpportunityTableFilters";
import OpportunityListHeader from "@/components/opportunity/OpportunityListHeader";
import ClientSummaryTableWithPagination from "@/components/opportunity/ClientSummaryTableWithPagination";
import OpportunitiesTableWithPagination from "@/components/opportunity/OpportunitiesTableWithPagination";

const OpportunityList = () => {
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
  
  const {
    opportunities,
    funnels,
    stages,
    loading,
    uniqueClients,
    loadOpportunities,
    getFunnelName,
    getStageName,
    getStageAlertStatus
  } = useOpportunityData(showArchived);

  const { filteredOpportunities, applyDateFilter } = useOpportunityFilters({
    opportunities,
    searchTerm,
    filterFunnel,
    filterStage,
    filterClient,
    dateFilter,
    dateRange
  });

  const clientSummary = useClientSummary({
    opportunities,
    uniqueClients,
    showUniqueClients,
    applyDateFilter
  });

  // Get available stages based on selected funnel
  const availableStages = filterFunnel 
    ? stages.filter(stage => stage.funnelId === filterFunnel)
    : stages;

  const handleArchive = async (opportunity: any, archive: boolean) => {
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

  if (loading) {
    return <LoadingScreen text="Carregando oportunidades..." />;
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
            <ClientSummaryTableWithPagination
              clientSummary={clientSummary || []}
              getFunnelName={getFunnelName}
              getStageName={getStageName}
              itemsPerPage={15}
            />
          ) : (
            <OpportunitiesTableWithPagination
              opportunities={filteredOpportunities}
              getFunnelName={getFunnelName}
              getStageName={getStageName}
              getStageAlertStatus={getStageAlertStatus}
              showArchived={showArchived}
              onArchive={handleArchive}
              onDelete={handleDelete}
              itemsPerPage={15}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityList;
