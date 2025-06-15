
import { Button } from "@/components/ui/button";
import { Archive, RefreshCw } from "lucide-react";
import ArchiveSettingsDialog from "./ArchiveSettingsDialog";

interface ArchiveSettings {
  enabled: boolean;
  period: number;
  lastRun: string | null;
  archiveWonOpportunities: boolean;
  archiveLostOpportunities: boolean;
}

interface OpportunityListHeaderProps {
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  refreshData: () => void;
  loading: boolean;
  archiveSettings: ArchiveSettings;
  setArchiveSettings: (settings: ArchiveSettings) => void;
  processAutoArchive: () => Promise<number>;
  isArchiveSettingsOpen: boolean;
  setIsArchiveSettingsOpen: (open: boolean) => void;
}

const OpportunityListHeader = ({
  showArchived,
  setShowArchived,
  refreshData,
  loading,
  archiveSettings,
  setArchiveSettings,
  processAutoArchive,
  isArchiveSettingsOpen,
  setIsArchiveSettingsOpen
}: OpportunityListHeaderProps) => {
  return (
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
          onClick={refreshData}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" /> 
          Atualizar
        </Button>
        
        <ArchiveSettingsDialog
          archiveSettings={archiveSettings}
          setArchiveSettings={setArchiveSettings}
          processAutoArchive={processAutoArchive}
          isOpen={isArchiveSettingsOpen}
          setIsOpen={setIsArchiveSettingsOpen}
        />
      </div>
    </div>
  );
};

export default OpportunityListHeader;
