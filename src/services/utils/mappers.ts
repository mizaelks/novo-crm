import { Funnel, Opportunity, Stage } from "@/types";

export const mapDbFunnelToFunnel = (dbFunnel: any): Omit<Funnel, 'stages'> => {
  return {
    id: dbFunnel.id,
    name: dbFunnel.name,
    description: dbFunnel.description || '',
    order: dbFunnel.order || 0
  };
};

export const mapDbStageToStage = (dbStage: any): Omit<Stage, 'opportunities' | 'requiredFields'> => {
  return {
    id: dbStage.id,
    name: dbStage.name,
    description: dbStage.description || '',
    order: dbStage.order || 0,
    funnelId: dbStage.funnel_id,
    color: dbStage.color || '#CCCCCC',
    isWinStage: dbStage.is_win_stage || false,
    isLossStage: dbStage.is_loss_stage || false,
    alertConfig: dbStage.alert_config ? {
      enabled: dbStage.alert_config.enabled || false,
      maxDaysInStage: dbStage.alert_config.maxDaysInStage || 3,
      alertMessage: dbStage.alert_config.alertMessage
    } : undefined
  };
};

export const mapDbOpportunityToOpportunity = (dbOpportunity: any): Opportunity => {
  return {
    id: dbOpportunity.id,
    title: dbOpportunity.title,
    value: dbOpportunity.value || 0,
    client: dbOpportunity.client,
    createdAt: new Date(dbOpportunity.created_at),
    stageId: dbOpportunity.stage_id,
    funnelId: dbOpportunity.funnel_id,
    phone: dbOpportunity.phone,
    email: dbOpportunity.email,
    company: dbOpportunity.company,
    customFields: dbOpportunity.custom_fields || {},
    lastStageChangeAt: dbOpportunity.last_stage_change_at ? new Date(dbOpportunity.last_stage_change_at) : undefined
  };
};
