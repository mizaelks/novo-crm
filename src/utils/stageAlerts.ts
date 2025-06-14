
import { Opportunity, Stage } from '@/types';

export const calculateDaysInStage = (opportunity: Opportunity): number => {
  const stageChangeDate = opportunity.lastStageChangeAt || opportunity.createdAt;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - stageChangeDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const shouldShowAlert = (opportunity: Opportunity, stage: Stage): boolean => {
  console.log(`shouldShowAlert - Stage: ${stage.name}`);
  console.log(`shouldShowAlert - Alert config:`, stage.alertConfig);
  console.log(`shouldShowAlert - Alert enabled:`, stage.alertConfig?.enabled);
  
  if (!stage.alertConfig?.enabled) {
    console.log(`shouldShowAlert - Alert not enabled for stage ${stage.name}`);
    return false;
  }
  
  const daysInStage = calculateDaysInStage(opportunity);
  const shouldAlert = daysInStage >= stage.alertConfig.maxDaysInStage;
  
  console.log(`shouldShowAlert - Days in stage: ${daysInStage}, Max days: ${stage.alertConfig.maxDaysInStage}, Should alert: ${shouldAlert}`);
  
  return shouldAlert;
};

export const getAlertMessage = (opportunity: Opportunity, stage: Stage): string => {
  if (!stage.alertConfig?.enabled) return '';
  
  const daysInStage = calculateDaysInStage(opportunity);
  const maxDays = stage.alertConfig.maxDaysInStage;
  
  if (daysInStage >= maxDays) {
    const overDays = daysInStage - maxDays;
    if (overDays === 0) {
      return '⚠️ Alerta';
    } else {
      return `⚠️ ${overDays}d atrasado`;
    }
  }
  
  return '';
};
