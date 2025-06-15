
import { Opportunity, Stage, ScheduledAction } from '@/types';
import { shouldShowAlert } from '@/utils/stageAlerts';
import { OpportunityAlertsBadge } from './OpportunityAlertsBadge';
import { OpportunityTasksBadge } from './OpportunityTasksBadge';

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
  
  if (!hasStageAlert && !hasPendingTasks) {
    return null;
  }

  return (
    <div className="flex flex-col gap-0.5 mb-1">
      <OpportunityAlertsBadge opportunity={opportunity} stage={stage} />
      <OpportunityTasksBadge 
        pendingTasks={pendingTasks} 
        onCompleteTask={onCompleteTask} 
      />
    </div>
  );
};
