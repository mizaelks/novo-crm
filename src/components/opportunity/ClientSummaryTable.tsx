
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";

interface ClientSummary {
  client: string;
  opportunityCount: number;
  totalValue: number;
  mostRecentDate: string | null;
  funnelId: string | null;
  stageId: string | null;
}

interface ClientSummaryTableProps {
  clientSummary: ClientSummary[];
  getFunnelName: (funnelId: string) => string;
  getStageName: (stageId: string) => string;
}

const ClientSummaryTable = ({
  clientSummary,
  getFunnelName,
  getStageName
}: ClientSummaryTableProps) => {
  if (!clientSummary || clientSummary.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum cliente encontrado com os filtros atuais
      </div>
    );
  }

  return (
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
  );
};

export default ClientSummaryTable;
