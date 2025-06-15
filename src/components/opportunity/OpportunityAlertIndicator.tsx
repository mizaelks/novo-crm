
import { Opportunity } from '@/types';
import { shouldShowAlert, getAlertMessage } from '@/utils/stageAlerts';
import { Badge } from '@/components/ui/badge';

interface OpportunityAlertIndicatorProps {
  opportunity: Opportunity;
  stageName?: string;
}

export const OpportunityAlertIndicator = ({ opportunity, stageName }: OpportunityAlertIndicatorProps) => {
  // Create a mock stage object for the shouldShowAlert function
  const mockStage = {
    name: stageName || '',
    alertConfig: opportunity.stage?.alertConfig
  };

  if (!shouldShowAlert(opportunity, mockStage as any)) {
    return null;
  }

  const alertMessage = getAlertMessage(opportunity, mockStage as any);

  return (
    <Badge variant="destructive" className="text-xs">
      {alertMessage}
    </Badge>
  );
};

export default OpportunityAlertIndicator;
