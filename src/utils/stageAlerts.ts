
import { Opportunity, Stage } from '@/types';

export const calculateDaysInStage = (opportunity: Opportunity): number => {
  const stageChangeDate = opportunity.lastStageChangeAt || opportunity.createdAt;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - stageChangeDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const shouldShowAlert = (opportunity: Opportunity, stage: Stage): boolean => {
  if (!stage.alertConfig?.enabled) return false;
  
  const daysInStage = calculateDaysInStage(opportunity);
  return daysInStage >= stage.alertConfig.maxDaysInStage;
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
