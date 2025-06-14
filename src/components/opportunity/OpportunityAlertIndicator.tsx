
import { Opportunity, Stage } from '@/types';
import { shouldShowAlert, getAlertMessage } from '@/utils/stageAlerts';
import { Badge } from '@/components/ui/badge';

interface OpportunityAlertIndicatorProps {
  opportunity: Opportunity;
  stage: Stage;
}

export const OpportunityAlertIndicator = ({ opportunity, stage }: OpportunityAlertIndicatorProps) => {
  if (!shouldShowAlert(opportunity, stage)) {
    return null;
  }

  const alertMessage = getAlertMessage(opportunity, stage);

  return (
    <Badge variant="destructive" className="text-xs">
      {alertMessage}
    </Badge>
  );
};
