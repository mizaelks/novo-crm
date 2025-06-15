
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Opportunity } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { OpportunityOwnerBadge } from "./OpportunityOwnerBadge";
import { OpportunityTasksBadge } from "./OpportunityTasksBadge";
import { OpportunityAlertIndicator } from "./OpportunityAlertIndicator";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Archive,
  RotateCcw
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => void;
  onView?: (opportunity: Opportunity) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  funnelIsShared?: boolean;
}

export const OpportunityCard = ({ 
  opportunity, 
  onEdit, 
  onDelete, 
  onView, 
  onArchive,
  onUnarchive,
  funnelIsShared = false 
}: OpportunityCardProps) => {
  const { user } = useAuth();
  const { isAdmin, isManager } = useUserRole();
  
  const isOwner = user?.id === opportunity.userId;
  const canEdit = isOwner || isAdmin || isManager;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
          <p className="text-sm text-gray-600">{opportunity.client}</p>
          {opportunity.company && (
            <p className="text-xs text-gray-500">{opportunity.company}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <OpportunityAlertIndicator opportunity={opportunity} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

      <div className="space-y-2">
        {opportunity.value && opportunity.value > 0 && (
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(opportunity.value)}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 items-center">
          <OpportunityOwnerBadge 
            userId={opportunity.userId} 
            funnelIsShared={funnelIsShared}
          />
          <OpportunityTasksBadge opportunity={opportunity} />
        </div>

        {(opportunity.phone || opportunity.email) && (
          <div className="text-xs text-gray-500 space-y-1">
            {opportunity.phone && <div>📞 {opportunity.phone}</div>}
            {opportunity.email && <div>✉️ {opportunity.email}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
