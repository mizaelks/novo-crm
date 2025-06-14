
import { useState, useEffect } from 'react';
import { Opportunity, Stage } from '@/types';
import { shouldShowAlert, calculateDaysInStage } from '@/utils/stageAlerts';

export const useStageAlerts = (opportunities: Opportunity[], stage: Stage) => {
  const [alertedOpportunities, setAlertedOpportunities] = useState<string[]>([]);

  useEffect(() => {
    if (!stage.alertConfig?.enabled) {
      setAlertedOpportunities([]);
      return;
    }

    const newAlertedOpportunities = opportunities
      .filter(opportunity => shouldShowAlert(opportunity, stage))
      .map(opportunity => opportunity.id);

    setAlertedOpportunities(newAlertedOpportunities);
  }, [opportunities, stage]);

  const getOpportunityAlertInfo = (opportunity: Opportunity) => {
    const isAlerted = alertedOpportunities.includes(opportunity.id);
    const daysInStage = calculateDaysInStage(opportunity);
    
    return {
      isAlerted,
      daysInStage,
      shouldShowAlert: shouldShowAlert(opportunity, stage)
    };
  };

  return {
    alertedOpportunities,
    getOpportunityAlertInfo,
    hasAlerts: alertedOpportunities.length > 0
  };
};
