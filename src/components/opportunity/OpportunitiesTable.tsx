
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OpportunityTableRow from "./OpportunityTableRow";
import { Opportunity } from "@/types";

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  getFunnelName: (funnelId: string) => string;
  getStageName: (stageId: string) => string;
  getStageAlertStatus: (opportunity: Opportunity) => boolean;
  showArchived: boolean;
  onArchive: (opportunity: Opportunity, archive: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const OpportunitiesTable = ({
  opportunities,
  getFunnelName,
  getStageName,
  getStageAlertStatus,
  showArchived,
  onArchive,
  onDelete
}: OpportunitiesTableProps) => {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma oportunidade encontrada com os filtros atuais
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Data de Criação</TableHead>
          {showArchived && <TableHead>Data de Arquivamento</TableHead>}
          <TableHead>Funil</TableHead>
          <TableHead>Etapa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {opportunities.map((opp) => (
          <OpportunityTableRow
            key={opp.id}
            opportunity={opp}
            getFunnelName={getFunnelName}
            getStageName={getStageName}
            getStageAlertStatus={getStageAlertStatus}
            showArchived={showArchived}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default OpportunitiesTable;
