
import { Funnel, Stage, Opportunity, WebhookConfig, ScheduledAction } from "@/types";

export const mapDbFunnelToFunnel = (dbFunnel: any): Omit<Funnel, 'stages'> => ({
  id: dbFunnel.id,
  name: dbFunnel.name,
  description: dbFunnel.description || "",
  order: dbFunnel.order || 0,
  funnelType: dbFunnel.funnel_type || 'venda'
});

export const mapDbStageToStage = (dbStage: any): Omit<Stage, 'opportunities'> => ({
  id: dbStage.id,
  name: dbStage.name,
  description: dbStage.description || "",
  order: dbStage.order || 0,
  funnelId: dbStage.funnel_id,
  color: dbStage.color || undefined,
  isWinStage: dbStage.is_win_stage || false,
  isLossStage: dbStage.is_loss_stage || false,
  requiredFields: dbStage.required_fields || [],
  requiredTasks: dbStage.required_tasks || [],
  alertConfig: dbStage.alert_config || undefined,
  migrateConfig: dbStage.migrate_config || undefined,
  sortConfig: dbStage.sort_config || undefined,
  winReasonRequired: dbStage.win_reason_required || false,
  lossReasonRequired: dbStage.loss_reason_required || false,
  winReasons: dbStage.win_reasons || [],
  lossReasons: dbStage.loss_reasons || []
});

export const mapDbOpportunityToOpportunity = (dbOpportunity: any): Opportunity => ({
  id: dbOpportunity.id,
  title: dbOpportunity.title,
  value: dbOpportunity.value,
  client: dbOpportunity.client,
  createdAt: new Date(dbOpportunity.created_at),
  stageId: dbOpportunity.stage_id,
  funnelId: dbOpportunity.funnel_id,
  scheduledActions: dbOpportunity.scheduled_actions || [],
  phone: dbOpportunity.phone || undefined,
  email: dbOpportunity.email || undefined,
  company: dbOpportunity.company || undefined,
  customFields: dbOpportunity.custom_fields || {},
  lastStageChangeAt: dbOpportunity.last_stage_change_at ? new Date(dbOpportunity.last_stage_change_at) : undefined,
  sourceOpportunityId: dbOpportunity.source_opportunity_id || undefined,
  requiredTasksCompleted: dbOpportunity.required_tasks_completed || [],
  userId: dbOpportunity.user_id || undefined,
  winReason: dbOpportunity.win_reason || undefined,
  lossReason: dbOpportunity.loss_reason || undefined
});

export const mapDbWebhookToWebhook = (dbWebhook: any): WebhookConfig => ({
  id: dbWebhook.id,
  targetType: dbWebhook.target_type,
  targetId: dbWebhook.target_id,
  url: dbWebhook.url,
  event: dbWebhook.event
});

export const mapDbScheduledActionToScheduledAction = (dbAction: any): ScheduledAction => ({
  id: dbAction.id,
  opportunityId: dbAction.opportunity_id,
  actionType: dbAction.action_type,
  actionConfig: dbAction.action_config || {},
  scheduledDateTime: new Date(dbAction.scheduled_datetime),
  status: dbAction.status || 'pending'
});
