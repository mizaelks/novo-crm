
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
  AlertTriangle,
  Calendar,
  FileText,
  Settings
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { shouldShowAlert, getAlertMessage } from "@/utils/stageAlerts";
import { PermissionGate } from "@/components/ui/permission-gate";

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
  const { canEditAllOpportunities, canDeleteOpportunities } = usePermissions();
  
  const isOwner = user?.id === opportunity.userId;
  const canEdit = isOwner || canEditAllOpportunities;
  const canDelete = isOwner || canDeleteOpportunities;
  const hasAlert = stage && shouldShowAlert(opportunity, stage);

  // Check for missing required fields
  const requiredFields = stage?.requiredFields || [];
  const missingRequiredFields = requiredFields.filter(field => {
    const fieldValue = opportunity.customFields?.[field.name];
    return !fieldValue || fieldValue === '' || (field.type === 'checkbox' && fieldValue !== true);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
      {/* Header com título e menu */}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{opportunity.title}</h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2 flex-shrink-0">
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
              
              <PermissionGate 
                permissions={['edit_all_opportunities', 'edit_own_opportunities']}
                fallback={null}
              >
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
              </PermissionGate>
              
              <PermissionGate 
                permissions={['edit_all_opportunities', 'edit_own_opportunities']}
                fallback={null}
              >
                {canEdit && !opportunity.archived && onArchive && (
                  <DropdownMenuItem onClick={() => onArchive(opportunity.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Arquivar
                  </DropdownMenuItem>
                )}
              </PermissionGate>
              
              <PermissionGate 
                permissions={['edit_all_opportunities', 'edit_own_opportunities']}
                fallback={null}
              >
                {canEdit && opportunity.archived && onUnarchive && (
                  <DropdownMenuItem onClick={() => onUnarchive(opportunity.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Desarquivar
                  </DropdownMenuItem>
                )}
              </PermissionGate>
              
              <PermissionGate permission="delete_opportunities" fallback={null}>
                {canDelete && onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(opportunity.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cliente */}
        <p className="text-sm text-gray-600 mb-1">{opportunity.client}</p>
        {opportunity.company && (
          <p className="text-xs text-gray-500 mb-2">{opportunity.company}</p>
        )}

        {/* Valor */}
        {opportunity.value && opportunity.value > 0 && (
          <div className="mb-3">
            <div className="text-base font-bold text-green-600">
              {formatCurrency(opportunity.value)}
            </div>
          </div>
        )}

        {/* Contatos */}
        {(opportunity.phone || opportunity.email) && (
          <div className="space-y-1 mb-3">
            {opportunity.phone && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="h-3 w-3" />
                <span>{opportunity.phone}</span>
              </div>
            )}
            {opportunity.email && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Mail className="h-3 w-3" />
                <span>{opportunity.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Alertas, tarefas e campos obrigatórios */}
        <div className="space-y-1">
          {hasAlert && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                {stage && getAlertMessage(opportunity, stage)}
              </Badge>
            </div>
          )}
          
          {opportunity.scheduledActions?.some(action => action.status === 'pending') && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-orange-500" />
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800">
                Tarefa pendente
              </Badge>
            </div>
          )}

          {missingRequiredFields.length > 0 && (
            <div className="flex items-center gap-1">
              <Settings className="h-3 w-3 text-blue-500" />
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800">
                {missingRequiredFields.length} campo(s) obrigatório(s)
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
