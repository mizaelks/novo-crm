
import { Opportunity, Stage } from '@/types';
import { shouldShowAlert, getAlertMessage } from '@/utils/stageAlerts';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface OpportunityAlertsProps {
  opportunity: Opportunity;
  stage: Stage;
}

export const OpportunityAlerts = ({ opportunity, stage }: OpportunityAlertsProps) => {
  console.log(`OpportunityAlerts - Checking opportunity: ${opportunity.title}`);
  console.log(`OpportunityAlerts - Stage: ${stage.name}`);
  console.log(`OpportunityAlerts - Stage alert config:`, stage.alertConfig);
  
  if (!shouldShowAlert(opportunity, stage)) {
    console.log(`OpportunityAlerts - No alert needed for ${opportunity.title}`);
    return null;
  }

  const alertMessage = getAlertMessage(opportunity, stage);
  console.log(`OpportunityAlerts - Alert message: ${alertMessage}`);

  return (
    <div className="flex items-center gap-1 mt-2">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
        {alertMessage}
      </Badge>
    </div>
  );
};
