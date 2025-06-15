
import { Opportunity, Stage, ScheduledAction } from '@/types';
import { shouldShowAlert, getAlertMessage } from '@/utils/stageAlerts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { DEFAULT_TASK_TEMPLATES } from '@/types/taskTemplates';

interface OpportunityMultipleAlertsProps {
  opportunity: Opportunity;
  stage: Stage;
  pendingTasks?: ScheduledAction[];
  onCompleteTask?: () => void;
}

export const OpportunityMultipleAlerts = ({ 
  opportunity, 
  stage, 
  pendingTasks = [],
  onCompleteTask
}: OpportunityMultipleAlertsProps) => {
  const hasStageAlert = shouldShowAlert(opportunity, stage);
  const hasPendingTasks = pendingTasks.length > 0;
  const firstPendingTask = pendingTasks[0];
  
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Clock className="h-3 w-3 text-orange-500 flex-shrink-0" />
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-orange-100 text-orange-800 border-orange-200 truncate">
              {pendingTasks.length === 1 
                ? getTaskLabel(pendingTasks[0])
                : `${pendingTasks.length} tarefas`
              }
            </Badge>
          </div>
          
          {onCompleteTask && firstPendingTask && (
            <Button
              size="sm"
              variant="outline"
              className="h-4 px-1.5 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onCompleteTask();
              }}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluir
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
