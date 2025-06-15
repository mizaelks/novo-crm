

import { Funnel, Stage, Opportunity, ScheduledAction, WebhookConfig } from "@/types";

export const mapDbFunnelToFunnel = (dbFunnel: any): Funnel => ({
  id: dbFunnel.id,
  name: dbFunnel.name,
  description: dbFunnel.description || "",
  order: dbFunnel.order || 0,
  stages: []
});

export const mapDbStageToStage = (dbStage: any): Stage => ({
  id: dbStage.id,
  name: dbStage.name,
  description: dbStage.description || "",
  order: dbStage.order || 0,
  funnelId: dbStage.funnel_id,
  opportunities: [],
  color: dbStage.color || "#CCCCCC",
  isWinStage: dbStage.is_win_stage || false,
  isLossStage: dbStage.is_loss_stage || false,
  alertConfig: dbStage.alert_config ? {
    enabled: dbStage.alert_config.enabled,
    maxDaysInStage: dbStage.alert_config.maxDaysInStage,
    alertMessage: dbStage.alert_config.alertMessage
  } : undefined,
  migrateConfig: dbStage.migrate_config ? {
    enabled: dbStage.migrate_config.enabled,
    targetFunnelId: dbStage.migrate_config.target_funnel_id,
    targetStageId: dbStage.migrate_config.target_stage_id
  } : undefined,
  winReasonRequired: dbStage.win_reason_required || false,
  lossReasonRequired: dbStage.loss_reason_required || false,
  winReasons: dbStage.win_reasons || [],
  lossReasons: dbStage.loss_reasons || []
});

export const mapDbOpportunityToOpportunity = (dbOpportunity: any): Opportunity => ({
  id: dbOpportunity.id,
  title: dbOpportunity.title,
  value: Number(dbOpportunity.value) || 0,
  client: dbOpportunity.client || "",
  createdAt: new Date(dbOpportunity.created_at),
  stageId: dbOpportunity.stage_id,
  funnelId: dbOpportunity.funnel_id,
  phone: dbOpportunity.phone,
  email: dbOpportunity.email,
  company: dbOpportunity.company,
  customFields: dbOpportunity.custom_fields || {},
  lastStageChangeAt: dbOpportunity.last_stage_change_at ? new Date(dbOpportunity.last_stage_change_at) : undefined,
  sourceOpportunityId: dbOpportunity.source_opportunity_id,
  requiredTasksCompleted: dbOpportunity.required_tasks_completed || [],
  userId: dbOpportunity.user_id,
  winReason: dbOpportunity.win_reason,
  lossReason: dbOpportunity.loss_reason
});

export const mapDbScheduledActionToScheduledAction = (dbScheduledAction: any): ScheduledAction => ({
  id: dbScheduledAction.id,
  opportunityId: dbScheduledAction.opportunity_id,
  actionType: dbScheduledAction.action_type,
  actionConfig: dbScheduledAction.action_config || {},
  scheduledDateTime: new Date(dbScheduledAction.scheduled_datetime),
  status: dbScheduledAction.status || 'pending'
});

export const mapDbWebhookToWebhook = (dbWebhook: any): WebhookConfig => ({
  id: dbWebhook.id,
  targetType: dbWebhook.target_type,
  targetId: dbWebhook.target_id,
  url: dbWebhook.url,
  event: dbWebhook.event
});

