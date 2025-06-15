
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Opportunity, Stage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Archive,
  RotateCcw,
  Phone,
  Mail,
  AlertTriangle
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { shouldShowAlert } from "@/utils/stageAlerts";

interface SimpleOpportunityCardProps {
  opportunity: Opportunity;
  stage?: Stage;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => void;
  onView?: (opportunity: Opportunity) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}

export const SimpleOpportunityCard = ({ 
  opportunity, 
  stage,
  onEdit, 
  onDelete, 
  onView, 
  onArchive,
  onUnarchive
}: SimpleOpportunityCardProps) => {
  const { user } = useAuth();
  const { isAdmin, isManager } = useUserRole();
  
  const isOwner = user?.id === opportunity.userId;
  const canEdit = isOwner || isAdmin || isManager;
  const canDelete = isOwner || isAdmin;
  const hasAlert = stage && shouldShowAlert(opportunity, stage);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
      {/* Header com título e menu */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{opportunity.title}</h3>
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          {hasAlert && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Alerta
            </Badge>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(opportunity)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
              )}
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canEdit && !opportunity.archived && onArchive && (
                <DropdownMenuItem onClick={() => onArchive(opportunity.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Arquivar
                </DropdownMenuItem>
              )}
              {canEdit && opportunity.archived && onUnarchive && (
                <DropdownMenuItem onClick={() => onUnarchive(opportunity.id)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Desarquivar
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(opportunity.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cliente e empresa */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 font-medium">{opportunity.client}</p>
        {opportunity.company && (
          <p className="text-xs text-gray-500">{opportunity.company}</p>
        )}
      </div>

      {/* Valor */}
      {opportunity.value && opportunity.value > 0 && (
        <div className="mb-3">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(opportunity.value)}
          </div>
        </div>
      )}

      {/* Contatos */}
      {(opportunity.phone || opportunity.email) && (
        <div className="space-y-1 mb-3">
          {opportunity.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="h-3 w-3 text-red-500" />
              <span>{opportunity.phone}</span>
            </div>
          )}
          {opportunity.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="h-3 w-3 text-gray-400" />
              <span>{opportunity.email}</span>
            </div>
          )}
        </div>
      )}

      {/* Badges de tarefas pendentes */}
      {opportunity.scheduledActions?.some(action => action.status === 'pending') && (
        <div className="flex items-center gap-1 text-xs">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
            📅 Tarefa pendente
          </Badge>
        </div>
      )}
    </div>
  );
};
