
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity, Stage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { 
  Phone,
  Mail,
  AlertTriangle,
  Calendar,
  FileText
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { shouldShowAlert, getAlertMessage } from "@/utils/stageAlerts";
import { usePendingTasks } from "@/hooks/usePendingTasks";

interface OpportunityCardProps {
  opportunity: Opportunity;
  stage?: Stage;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => void;
  onView?: (opportunity: Opportunity) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onAddTask?: (opportunity: Opportunity) => void;
  onAddField?: (opportunity: Opportunity) => void;
  funnelIsShared?: boolean;
}

export const OpportunityCard = ({ 
  opportunity, 
  stage,
  onEdit, 
  onDelete, 
  onView, 
  onArchive,
  onUnarchive,
  onAddTask,
  onAddField,
  funnelIsShared = false 
}: OpportunityCardProps) => {
  const { user } = useAuth();
  const { isAdmin, isManager } = useUserRole();
  const { pendingTasks, completeTask } = usePendingTasks(opportunity.id);
  
  const isOwner = user?.id === opportunity.userId;
  const canEdit = isOwner || isAdmin || isManager;
  const canDelete = isOwner || isAdmin;
  const hasAlert = stage && shouldShowAlert(opportunity, stage);

  const handleCompleteTask = async () => {
    if (pendingTasks.length > 0) {
      await completeTask(pendingTasks[0].id);
    }
  };

  const handleCardClick = () => {
    if (onView) {
      onView(opportunity);
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header com título */}
      <div className="p-3 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{opportunity.title}</h3>
          </div>
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

        {/* Alertas e tarefas */}
        <div className="space-y-1">
          {hasAlert && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                {stage && getAlertMessage(opportunity, stage)}
              </Badge>
            </div>
          )}
          
          {pendingTasks.length > 0 && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-orange-500" />
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800">
                  {pendingTasks.length === 1 ? 'Tarefa pendente' : `${pendingTasks.length} tarefas`}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-5 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteTask();
                }}
              >
                Concluir
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer com ações rápidas */}
      {(onAddTask || onAddField) && (
        <div className="border-t bg-gray-50/50 px-3 py-2 flex items-center justify-center gap-3 text-xs">
          {onAddTask && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onAddTask(opportunity);
              }}
            >
              <Calendar className="h-3 w-3" />
              tarefa
            </Button>
          )}
          
          {onAddTask && onAddField && (
            <span className="text-gray-400">|</span>
          )}
          
          {onAddField && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onAddField(opportunity);
              }}
            >
              <FileText className="h-3 w-3" />
              campo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
