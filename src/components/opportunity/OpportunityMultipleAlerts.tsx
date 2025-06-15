
import { Opportunity, Stage, ScheduledAction } from '@/types';
import { shouldShowAlert, getAlertMessage } from '@/utils/stageAlerts';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import { DEFAULT_TASK_TEMPLATES } from '@/types/taskTemplates';

interface OpportunityMultipleAlertsProps {
  opportunity: Opportunity;
  stage: Stage;
  pendingTasks?: ScheduledAction[];
}

export const OpportunityMultipleAlerts = ({ 
  opportunity, 
  stage, 
  pendingTasks = [] 
}: OpportunityMultipleAlertsProps) => {
  const hasStageAlert = shouldShowAlert(opportunity, stage);
  const hasPendingTasks = pendingTasks.length > 0;
  
  if (!hasStageAlert && !hasPendingTasks) {
    return null;
  }

  const getTaskLabel = (task: ScheduledAction) => {
    const template = DEFAULT_TASK_TEMPLATES.find(t => t.id === task.actionConfig.templateId);
    return template ? template.name : task.actionConfig.title || 'Tarefa';
  };

  return (
    <div className="flex flex-col gap-0.5 mb-1">
      {hasStageAlert && (
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
          <Badge variant="destructive" className="text-xs px-1.5 py-0 h-4">
            {getAlertMessage(opportunity, stage)}
          </Badge>
        </div>
      )}
      
      {hasPendingTasks && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-orange-500 flex-shrink-0" />
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-orange-100 text-orange-800 border-orange-200">
            {pendingTasks.length === 1 
              ? getTaskLabel(pendingTasks[0])
              : `${pendingTasks.length} tarefas`
            }
          </Badge>
        </div>
      )}
    </div>
  );
};
