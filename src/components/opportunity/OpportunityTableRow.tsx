
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Opportunity, Stage } from "@/types";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import { Trash2, Archive, ExternalLink, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface OpportunityTableRowProps {
  opportunity: Opportunity;
  getFunnelName: (funnelId: string) => string;
  getStageName: (stageId: string) => string;
  getStageAlertStatus: (opportunity: Opportunity) => boolean;
  showArchived: boolean;
  onArchive: (opportunity: Opportunity, archive: boolean) => void;
  onDelete: (id: string) => void;
}

const OpportunityTableRow = ({
  opportunity,
  getFunnelName,
  getStageName,
  getStageAlertStatus,
  showArchived,
  onArchive,
  onDelete
}: OpportunityTableRowProps) => {
  const hasAlert = getStageAlertStatus(opportunity);

  return (
    <TableRow className={hasAlert ? "bg-red-50" : ""}>
      <TableCell>
        <div className="flex items-center gap-2">
          {hasAlert && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <span className={hasAlert ? "font-medium" : ""}>{opportunity.title}</span>
        </div>
      </TableCell>
      <TableCell>{opportunity.client}</TableCell>
      <TableCell>{formatCurrency(opportunity.value)}</TableCell>
      <TableCell>{formatDateBRT(opportunity.createdAt)}</TableCell>
      <TableCell>{getFunnelName(opportunity.funnelId)}</TableCell>
      <TableCell>{getStageName(opportunity.stageId)}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          {hasAlert && (
            <Badge variant="destructive" className="text-xs">
              Alerta
            </Badge>
          )}
          <Badge variant="outline">
            {opportunity.scheduledActions?.some(
              action => action.status === 'pending'
            ) 
              ? "Com ações agendadas"
              : "Sem ações agendadas"
            }
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            asChild
          >
            <Link to={`/funnels/${opportunity.funnelId}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onArchive(opportunity, !showArchived)}
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
                  oportunidade "{opportunity.title}" do cliente {opportunity.client} e removerá 
                  todos os dados associados a ela.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(opportunity.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OpportunityTableRow;
