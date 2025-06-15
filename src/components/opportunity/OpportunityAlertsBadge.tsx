
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { Opportunity, Stage } from '@/types';
import { shouldShowAlert, getAlertMessage } from '@/utils/stageAlerts';

interface OpportunityAlertsBadgeProps {
  opportunity: Opportunity;
  stage: Stage;
}

export const OpportunityAlertsBadge = ({ opportunity, stage }: OpportunityAlertsBadgeProps) => {
  const hasStageAlert = shouldShowAlert(opportunity, stage);
  
  if (!hasStageAlert) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
      <Badge variant="destructive" className="text-xs px-1.5 py-0 h-4">
        {getAlertMessage(opportunity, stage)}
      </Badge>
    </div>
  );
};
